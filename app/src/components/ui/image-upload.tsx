import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Upload, Image as ImageIcon, Video, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { mediaAPI } from '@/lib/api';
import { toast } from 'sonner';

interface ImageUploadProps {
  value?: string[]; // Array of R2 keys
  onChange?: (files: string[]) => void; // Callback with R2 keys
  maxFiles?: number;
  accept?: string;
  className?: string;
}

export function ImageUpload({ value = [], onChange, maxFiles = 10, accept = 'image/*,video/*', className }: ImageUploadProps) {
  const [previews, setPreviews] = useState<string[]>([]); // Presigned URLs for display
  const [r2Keys, setR2Keys] = useState<string[]>([]); // R2 keys stored in DB
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<number, boolean>>({});
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter out base64 data and only keep valid R2 keys
  const filterValidR2Keys = (keys: string[]): string[] => {
    return keys.filter(key => {
      // Reject base64 data
      if (key.startsWith('data:')) {
        console.warn('Removing base64 data from media array:', key.substring(0, 50) + '...');
        return false;
      }
      // Reject full URLs (should be R2 keys, not URLs)
      if (key.startsWith('http://') || key.startsWith('https://')) {
        // Extract key from URL if it's a presigned URL, otherwise reject
        try {
          new URL(key); // Validate URL format
          // If it's a presigned URL, we can't extract the key easily, so reject it
          // The backend will generate new presigned URLs anyway
          console.warn('Removing URL from media array (should be R2 key):', key.substring(0, 50) + '...');
          return false;
        } catch {
          return false;
        }
      }
      // Accept R2 keys (format: userId/timestamp-random.extension)
      return key.includes('/') && !key.includes(' ');
    });
  };

  // Sync r2Keys with value prop, filtering out invalid data
  useEffect(() => {
    const validKeys = filterValidR2Keys(value);
    if (validKeys.length !== value.length) {
      console.warn(`Filtered out ${value.length - validKeys.length} invalid media entries (base64/URLs)`);
      // Update parent if we filtered out invalid data
      if (onChange && validKeys.length !== value.length) {
        onChange(validKeys);
      }
    }
    setR2Keys(validKeys);
  }, [value, onChange]);

  // Load presigned URLs for existing R2 keys
  useEffect(() => {
    const loadPresignedUrls = async () => {
      if (r2Keys.length === 0) {
        setPreviews([]);
        return;
      }

      try {
        // Generate presigned URLs for all R2 keys
        const urls = await Promise.all(
          r2Keys.map(async (key) => {
            // Skip if already a URL (shouldn't happen, but just in case)
            if (key.startsWith('http://') || key.startsWith('https://')) {
              console.warn('Unexpected URL in R2 keys array:', key.substring(0, 50));
              return key; // Use as-is for display
            }
            // Skip if base64 (legacy data - should be filtered out already)
            if (key.startsWith('data:')) {
              console.warn('Unexpected base64 in R2 keys array:', key.substring(0, 50));
              return key; // Use as-is for display
            }
            try {
              const response = await mediaAPI.getPresignedUrl(key);
              return response.data.url;
            } catch (error) {
              console.error(`Failed to get presigned URL for ${key}:`, error);
              return null;
            }
          })
        );
        setPreviews(urls.filter(url => url !== null) as string[]);
      } catch (error) {
        console.error('Error loading presigned URLs:', error);
      }
    };

    loadPresignedUrls();
  }, [r2Keys]);

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    
    const fileArray = Array.from(files).slice(0, maxFiles - r2Keys.length);
    if (fileArray.length === 0) {
      toast.error(`Maximum ${maxFiles} files allowed`);
      return;
    }

    setUploading(true);
    const newR2Keys: string[] = [];
    const newPreviews: string[] = [];
    const tempPreviews: string[] = []; // Temporary base64 previews while uploading

    // Create temporary previews for immediate feedback
    fileArray.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        tempPreviews[index] = result;
        setPreviews([...previews, ...tempPreviews.filter(p => p)]);
      };
      reader.readAsDataURL(file);
      setUploadProgress({ ...uploadProgress, [index]: true });
    });

    try {
      // Upload files to R2
      const formData = new FormData();
      fileArray.forEach((file) => {
        formData.append('files', file);
      });

      const response = await mediaAPI.upload(formData);
      const uploadedKeys = response.data.files; // Array of R2 keys

      // Get presigned URLs for uploaded files
      for (let i = 0; i < uploadedKeys.length; i++) {
        const key = uploadedKeys[i];
        newR2Keys.push(key);
        
        try {
          const urlResponse = await mediaAPI.getPresignedUrl(key);
          newPreviews.push(urlResponse.data.url);
        } catch (error) {
          console.error(`Failed to get presigned URL for ${key}:`, error);
          // Use temp preview as fallback
          newPreviews.push(tempPreviews[i]);
        }
        
        setUploadProgress((prev) => ({ ...prev, [i]: false }));
      }

      // Update state - ensure we only store R2 keys (no base64)
      const updatedR2Keys = [...r2Keys, ...newR2Keys].filter(key => {
        // Double-check: reject any base64 that might have slipped through
        if (key.startsWith('data:')) {
          console.error('ERROR: Base64 data detected in R2 keys array!', key.substring(0, 50));
          return false;
        }
        return true;
      });
      const updatedPreviews = [...previews, ...newPreviews];
      
      setR2Keys(updatedR2Keys);
      setPreviews(updatedPreviews);
      // Only pass R2 keys to parent, never base64
      onChange?.(updatedR2Keys);
      
      toast.success(`Uploaded ${newR2Keys.length} file(s) successfully`);
    } catch (error: any) {
      console.error('Error uploading files:', error);
      toast.error(error.response?.data?.error || error.response?.data?.message || 'Failed to upload files');
      // Remove temp previews on error
      setPreviews(previews);
    } finally {
      setUploading(false);
      setUploadProgress({});
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  const removeFile = async (index: number) => {
    const keyToRemove = r2Keys[index];
    
    // Remove from state immediately for better UX
    const updatedR2Keys = r2Keys.filter((_, i) => i !== index);
    const updatedPreviews = previews.filter((_, i) => i !== index);
    
    setR2Keys(updatedR2Keys);
    setPreviews(updatedPreviews);
    // Only pass R2 keys to parent, never base64
    onChange?.(updatedR2Keys);

    // Delete from R2 in background
    if (keyToRemove && !keyToRemove.startsWith('data:')) {
      try {
        await mediaAPI.delete(keyToRemove);
      } catch (error) {
        console.error('Error deleting file from R2:', error);
        // Don't show error to user as file is already removed from UI
      }
    }
  };

  const isVideo = (url: string) => url.startsWith('data:video') || url.includes('video');

  return (
    <div className={cn('space-y-4', className)}>
      <div
        className={cn(
          'relative border-2 border-dashed rounded-xl p-8 transition-all duration-300',
          dragActive
            ? 'border-primary bg-primary/10 scale-[1.02]'
            : 'border-border/50 bg-muted/30 hover:border-primary/50 hover:bg-muted/50'
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={accept}
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/25">
            <Upload className="h-8 w-8 text-primary-foreground" />
          </div>
          <div>
            <p className="text-base font-semibold text-foreground">
              Drop images or videos here
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              or click to browse from your device
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Supports JPG, PNG, GIF, MP4, MOV (max {maxFiles} files)
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="mt-2"
            disabled={uploading}
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Choose Files
              </>
            )}
          </Button>
        </div>
      </div>

      {previews.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {previews.map((preview, index) => (
            <div
              key={index}
              className="group relative aspect-square rounded-lg overflow-hidden border-2 border-border/50 bg-muted/30 hover:border-primary/50 transition-all duration-300 hover:scale-105"
            >
              {isVideo(preview) ? (
                <video
                  src={preview}
                  className="w-full h-full object-cover"
                  controls
                />
              ) : (
                <img
                  src={preview}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              )}
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-destructive/90 hover:bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="absolute bottom-2 left-2">
                {isVideo(preview) ? (
                  <div className="px-2 py-1 bg-background/80 backdrop-blur-sm rounded-full text-xs font-medium flex items-center gap-1">
                    <Video className="h-3 w-3" />
                    Video
                  </div>
                ) : (
                  <div className="px-2 py-1 bg-background/80 backdrop-blur-sm rounded-full text-xs font-medium flex items-center gap-1">
                    <ImageIcon className="h-3 w-3" />
                    Image
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

