import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { authAPI, mediaAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Field, FieldLabel } from '@/components/ui/field';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { ImageUpload } from '@/components/ui/image-upload';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, Save, User, Globe, Lock, Users, ExternalLink, Twitter, Instagram, Linkedin, MapPin, Link as LinkIcon, Mail, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface UserProfile {
  _id: string;
  email: string;
  username?: string;
  fullName?: string;
  bio?: string;
  profileImage?: string;
  profileImageUrl?: string; // Presigned URL for display
  isPublicProfile: boolean;
  location?: string;
  website?: string;
  socialLinks?: {
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
  followers?: any[];
  following?: any[];
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    _id: '',
    email: '',
    isPublicProfile: false,
  });
  const [formData, setFormData] = useState({
    fullName: '',
    bio: '',
    profileImage: '', // R2 key
    isPublicProfile: false,
    location: '',
    website: '',
    socialLinks: {
      twitter: '',
      instagram: '',
      linkedin: '',
    },
  });
  const [profileImageUrl, setProfileImageUrl] = useState<string>(''); // Presigned URL for display
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await authAPI.getProfile();
      const user = response.data.user;
      setProfile(user);
      
      // Get presigned URL for profile image if it exists
      if (user.profileImage) {
        try {
          const urlResponse = await mediaAPI.getPresignedUrl(user.profileImage);
          setProfileImageUrl(urlResponse.data.url);
        } catch (error) {
          console.error('Error getting presigned URL:', error);
        }
      }
      
      setFormData({
        fullName: user.fullName || '',
        bio: user.bio || '',
        profileImage: user.profileImage || '',
        isPublicProfile: user.isPublicProfile || false,
        location: user.location || '',
        website: user.website || '',
        socialLinks: {
          twitter: user.socialLinks?.twitter || '',
          instagram: user.socialLinks?.instagram || '',
          linkedin: user.socialLinks?.linkedin || '',
        },
      });
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (r2Keys: string[]) => {
    if (r2Keys.length === 0) return;
    
    try {
      const imageKey = r2Keys[0]; // Profile image is single file
      
      // Get presigned URL for display
      const urlResponse = await mediaAPI.getPresignedUrl(imageKey);
      setProfileImageUrl(urlResponse.data.url);
      
      setFormData({ ...formData, profileImage: imageKey });
      toast.success('Profile picture uploaded');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to upload image');
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (formData.bio && formData.bio.length > 500) {
      newErrors.bio = 'Bio must be 500 characters or less';
    }
    
    if (formData.website && !/^https?:\/\/.+/.test(formData.website)) {
      newErrors.website = 'Website must be a valid URL (starting with http:// or https://)';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!validateForm()) {
      return;
    }
    
    setSaving(true);

    try {
      const response = await authAPI.updateProfile({
        fullName: formData.fullName,
        bio: formData.bio,
        profileImage: formData.profileImage,
        isPublicProfile: formData.isPublicProfile,
        location: formData.location,
        website: formData.website,
        socialLinks: formData.socialLinks,
      });
      setProfile(response.data.user);
      setErrors({});
      toast.success('Profile updated successfully');
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to update profile';
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black p-6 md:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-10 w-48" />
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="p-6">
                <Skeleton className="h-32 w-32 rounded-full mx-auto mb-4" />
                <Skeleton className="h-6 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="p-6">
                <Skeleton className="h-6 w-32 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-blue-900/10 to-pink-900/10" />
      
      {/* Animated background lines */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      </div>

      <div className="relative z-10 p-6 md:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-4"
          >
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="text-white hover:bg-zinc-800/50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-4xl font-bold text-white">Profile Settings</h1>
              <p className="text-gray-400 mt-1">Manage your profile and account settings</p>
            </div>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Main Form */}
              <div className="lg:col-span-2 space-y-6">
                {/* Profile Picture */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <Card className="bg-zinc-900/80 backdrop-blur-xl border-zinc-800/50 shadow-2xl">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Profile Picture
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-6">
                        {profileImageUrl ? (
                          <Avatar className="h-24 w-24 border-4 border-purple-500/50">
                            <AvatarImage src={profileImageUrl} alt="Profile" />
                            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white text-2xl">
                              {profile.username?.charAt(0).toUpperCase() || profile.email.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        ) : (
                          <div className="h-24 w-24 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-3xl font-bold border-4 border-purple-500/50">
                            {profile.username?.charAt(0).toUpperCase() || profile.email.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="flex-1">
                          <ImageUpload
                            value={formData.profileImage ? [formData.profileImage] : []}
                            onChange={handleImageUpload}
                            maxFiles={1}
                            accept="image/*"
                          />
                          <p className="text-xs text-gray-400 mt-2">
                            Recommended: Square image, at least 400x400px
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Basic Information */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <Card className="bg-zinc-900/80 backdrop-blur-xl border-zinc-800/50 shadow-2xl">
                    <CardHeader>
                      <CardTitle className="text-white">Basic Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Field>
                        <FieldLabel className="text-white flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Username
                        </FieldLabel>
                        <Input
                          value={profile.username || ''}
                          disabled
                          readOnly
                          className="bg-zinc-800/50 text-gray-400 cursor-not-allowed"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Username cannot be changed once set
                        </p>
                      </Field>

                      <Field>
                        <FieldLabel className="text-white">Full Name</FieldLabel>
                        <Input
                          value={formData.fullName}
                          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                          placeholder="Your full name"
                          className="bg-zinc-800 text-white placeholder:text-gray-500"
                        />
                      </Field>

                      <Field>
                        <FieldLabel className="text-white flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          Email
                        </FieldLabel>
                        <Input
                          value={profile.email}
                          disabled
                          readOnly
                          className="bg-zinc-800/50 text-gray-400 cursor-not-allowed"
                        />
                      </Field>

                      <Field>
                        <FieldLabel className="text-white">Bio</FieldLabel>
                        <Textarea
                          value={formData.bio}
                          onChange={(e) => {
                            setFormData({ ...formData, bio: e.target.value });
                            if (errors.bio) setErrors({ ...errors, bio: '' });
                          }}
                          placeholder="Tell us about yourself..."
                          maxLength={500}
                          className={`bg-zinc-800 text-white placeholder:text-gray-500 ${errors.bio ? 'border-red-500' : ''}`}
                          rows={4}
                        />
                        {errors.bio && (
                          <p className="text-xs text-red-400 mt-1">{errors.bio}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">{formData.bio.length}/500</p>
                      </Field>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Additional Information */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <Card className="bg-zinc-900/80 backdrop-blur-xl border-zinc-800/50 shadow-2xl">
                    <CardHeader>
                      <CardTitle className="text-white">Additional Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Field>
                        <FieldLabel className="text-white flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          Location
                        </FieldLabel>
                        <Input
                          value={formData.location}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                          placeholder="City, Country"
                          className="bg-zinc-800 text-white placeholder:text-gray-500"
                        />
                      </Field>

                      <Field>
                        <FieldLabel className="text-white flex items-center gap-2">
                          <LinkIcon className="h-4 w-4" />
                          Website
                        </FieldLabel>
                        <Input
                          value={formData.website}
                          onChange={(e) => {
                            setFormData({ ...formData, website: e.target.value });
                            if (errors.website) setErrors({ ...errors, website: '' });
                          }}
                          placeholder="https://yourwebsite.com"
                          className={`bg-zinc-800 text-white placeholder:text-gray-500 ${errors.website ? 'border-red-500' : ''}`}
                        />
                        {errors.website && (
                          <p className="text-xs text-red-400 mt-1">{errors.website}</p>
                        )}
                      </Field>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Social Links */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <Card className="bg-zinc-900/80 backdrop-blur-xl border-zinc-800/50 shadow-2xl">
                    <CardHeader>
                      <CardTitle className="text-white">Social Links</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Field>
                        <FieldLabel className="text-white flex items-center gap-2">
                          <Twitter className="h-4 w-4" />
                          Twitter
                        </FieldLabel>
                        <Input
                          value={formData.socialLinks.twitter}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              socialLinks: { ...formData.socialLinks, twitter: e.target.value },
                            })
                          }
                          placeholder="@username"
                          className="bg-zinc-800 text-white placeholder:text-gray-500"
                        />
                      </Field>

                      <Field>
                        <FieldLabel className="text-white flex items-center gap-2">
                          <Instagram className="h-4 w-4" />
                          Instagram
                        </FieldLabel>
                        <Input
                          value={formData.socialLinks.instagram}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              socialLinks: { ...formData.socialLinks, instagram: e.target.value },
                            })
                          }
                          placeholder="@username"
                          className="bg-zinc-800 text-white placeholder:text-gray-500"
                        />
                      </Field>

                      <Field>
                        <FieldLabel className="text-white flex items-center gap-2">
                          <Linkedin className="h-4 w-4" />
                          LinkedIn
                        </FieldLabel>
                        <Input
                          value={formData.socialLinks.linkedin}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              socialLinks: { ...formData.socialLinks, linkedin: e.target.value },
                            })
                          }
                          placeholder="linkedin.com/in/username"
                          className="bg-zinc-800 text-white placeholder:text-gray-500"
                        />
                      </Field>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Privacy Settings */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <Card className="bg-zinc-900/80 backdrop-blur-xl border-zinc-800/50 shadow-2xl">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        {formData.isPublicProfile ? (
                          <Globe className="h-5 w-5 text-blue-400" />
                        ) : (
                          <Lock className="h-5 w-5 text-gray-400" />
                        )}
                        Privacy Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg">
                        <div className="flex-1">
                          <p className="text-white font-medium mb-1">Public Profile</p>
                          <p className="text-xs text-gray-400">
                            {formData.isPublicProfile
                              ? 'Your profile is visible to everyone'
                              : 'Your profile is private'}
                          </p>
                        </div>
                        <Switch
                          checked={formData.isPublicProfile}
                          onCheckedChange={(checked) =>
                            setFormData({ ...formData, isPublicProfile: checked })
                          }
                        />
                      </div>
                      {formData.isPublicProfile && profile.username && (
                        <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                          <p className="text-xs text-blue-300 mb-2">Your public profile:</p>
                          <Link
                            to={`/u/${profile.username}`}
                            target="_blank"
                            className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
                          >
                            /u/{profile.username}
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Stats */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <Card className="bg-zinc-900/80 backdrop-blur-xl border-zinc-800/50 shadow-2xl">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Connections
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-2xl font-bold text-white">{profile.followers?.length || 0}</p>
                          <p className="text-xs text-gray-400">Followers</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-white">{profile.following?.length || 0}</p>
                          <p className="text-xs text-gray-400">Following</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-white">
                            {(profile.followers?.length || 0) + (profile.following?.length || 0)}
                          </p>
                          <p className="text-xs text-gray-400">Total</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Public Profile Preview */}
                {formData.isPublicProfile && profile.username && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                  >
                    <Card className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 backdrop-blur-xl border-purple-500/20 shadow-2xl">
                      <CardHeader>
                        <CardTitle className="text-white">Preview</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-300 mb-4">
                          Your profile will be visible to everyone at:
                        </p>
                        <Link
                          to={`/u/${profile.username}`}
                          target="_blank"
                          className="text-blue-400 hover:text-blue-300 flex items-center gap-2 text-sm"
                        >
                          /u/{profile.username}
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="flex justify-between items-center gap-4 pt-6"
            >
              <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogTrigger asChild>
                  <Button
                    type="button"
                    variant="destructive"
                    className="text-white"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Account
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-zinc-900/95 border-zinc-800">
                  <DialogHeader>
                    <DialogTitle className="text-white">Delete Account</DialogTitle>
                    <DialogDescription className="text-gray-400">
                      Are you absolutely sure? This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setShowDeleteDialog(false)}
                      className="text-white border-zinc-700 hover:bg-zinc-800"
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        // TODO: Implement account deletion
                        toast.error('Account deletion not yet implemented');
                        setShowDeleteDialog(false);
                      }}
                    >
                      Delete Account
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <div className="flex gap-4 ml-auto">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => navigate(-1)}
                  className="text-white hover:bg-zinc-800/50"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={saving || Object.keys(errors).length > 0}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                  <Save className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          </form>
        </div>
      </div>
    </div>
  );
}