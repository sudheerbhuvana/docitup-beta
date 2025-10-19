import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { entriesAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  ArrowLeft, 
  Heart, 
  MessageCircle, 
  Share2, 
  ChevronLeft, 
  ChevronRight,
  X,
  Trash2,
  Edit,
  Lock,
  Users,
  Globe
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface Entry {
  _id: string;
  title?: string;
  content: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  mood?: 'great' | 'good' | 'okay' | 'bad' | 'terrible';
  tags?: string[];
  media?: string[];
  mediaUrls?: string[];
  visibility?: 'private' | 'followers' | 'public';
  likes?: any[];
  likesCount?: number;
  commentsCount?: number;
  isLiked?: boolean;
  userId?: {
    _id: string;
    username?: string;
    fullName?: string;
    profileImage?: string;
  };
}

interface Comment {
  _id: string;
  content: string;
  createdAt: string;
  userId: {
    _id: string;
    username?: string;
    fullName?: string;
    profileImage?: string;
  };
}

const moodEmojis: Record<string, string> = {
  great: '😄',
  good: '😊',
  okay: '😐',
  bad: '☹️',
  terrible: '😢',
};

const visibilityIcons: Record<string, { icon: any; label: string }> = {
  private: { icon: Lock, label: 'Private' },
  followers: { icon: Users, label: 'Followers Only' },
  public: { icon: Globe, label: 'Public' },
};

export default function EntryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [entry, setEntry] = useState<Entry | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [liking, setLiking] = useState(false);
  const [commenting, setCommenting] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [showFullScreen, setShowFullScreen] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    // Handle "new" route - redirect to journal page
    if (id === 'new') {
      navigate('/journal');
      return;
    }
    
    if (id) {
      fetchEntry();
      fetchComments();
    }
  }, [id, navigate]);

  const fetchEntry = async () => {
    try {
      const response = await entriesAPI.getById(id!);
      const entryData = response.data.entry;
      setEntry(entryData);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to load entry');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await entriesAPI.getComments(id!);
      setComments(response.data.comments || []);
    } catch (error: any) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleLike = async () => {
    if (!entry || !currentUser) return;
    
    // Check visibility
    if (entry.visibility === 'private' && entry.userId?._id?.toString() !== currentUser.id) {
      toast.error('Cannot like private posts');
      return;
    }

    setLiking(true);
    try {
      const response = await entriesAPI.toggleLike(id!);
      setEntry({
        ...entry,
        isLiked: response.data.liked,
        likesCount: response.data.likesCount,
      });
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to like post');
    } finally {
      setLiking(false);
    }
  };

  const handleComment = async () => {
    if (!commentText.trim() || !entry || !currentUser) return;

    // Check visibility
    if (entry.visibility === 'private' && entry.userId?._id?.toString() !== currentUser.id) {
      toast.error('Cannot comment on private posts');
      return;
    }

    setCommenting(true);
    try {
      const response = await entriesAPI.createComment(id!, commentText);
      setComments([response.data.comment, ...comments]);
      setEntry({
        ...entry,
        commentsCount: (entry.commentsCount || 0) + 1,
      });
      setCommentText('');
      toast.success('Comment added');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to add comment');
    } finally {
      setCommenting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await entriesAPI.deleteComment(id!, commentId);
      setComments(comments.filter(c => c._id !== commentId));
      setEntry({
        ...entry!,
        commentsCount: Math.max(0, (entry?.commentsCount || 0) - 1),
      });
      toast.success('Comment deleted');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete comment');
    }
  };

  const handleDeleteEntry = async () => {
    try {
      await entriesAPI.delete(id!);
      toast.success('Entry deleted');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete entry');
    }
  };

  const nextMedia = () => {
    if (entry?.mediaUrls && entry.mediaUrls.length > 0) {
      setCurrentMediaIndex((prev) => (prev + 1) % entry.mediaUrls!.length);
    }
  };

  const prevMedia = () => {
    if (entry?.mediaUrls && entry.mediaUrls.length > 0) {
      setCurrentMediaIndex((prev) => (prev - 1 + entry.mediaUrls!.length) % entry.mediaUrls!.length);
    }
  };

  const canInteract = () => {
    if (!entry || !currentUser) return false;
    if (entry.visibility === 'private' && entry.userId?._id?.toString() !== currentUser.id) return false;
    return entry.visibility === 'followers' || entry.visibility === 'public';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Entry not found</div>
      </div>
    );
  }

  const mediaUrls = entry.mediaUrls || [];
  const hasMultipleMedia = mediaUrls.length > 1;
  const isOwner = currentUser?.id === entry.userId?._id?.toString();

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-blue-900/10 to-pink-900/10" />
      
      {/* Animated background lines */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      </div>

      <div className="relative z-10 p-6 md:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 mb-6"
          >
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="text-white hover:bg-zinc-800/50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            {isOwner && (
              <div className="flex gap-2 ml-auto">
                <Button
                  variant="ghost"
                  onClick={() => navigate(`/journal/${id}/edit`)}
                  className="text-white hover:bg-zinc-800/50"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-red-400 hover:bg-red-500/10"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            )}
          </motion.div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Media Carousel */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              <Card className="bg-zinc-900/80 backdrop-blur-xl border-zinc-800/50 shadow-2xl overflow-hidden">
                {mediaUrls.length > 0 ? (
                  <div className="relative aspect-square bg-black">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={currentMediaIndex}
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        transition={{ duration: 0.3 }}
                        className="absolute inset-0"
                      >
                        {mediaUrls[currentMediaIndex]?.includes('video') || mediaUrls[currentMediaIndex]?.includes('.mp4') ? (
                          <video
                            src={mediaUrls[currentMediaIndex]}
                            className="w-full h-full object-contain"
                            controls
                            autoPlay
                          />
                        ) : (
                          <img
                            src={mediaUrls[currentMediaIndex]}
                            alt={`Media ${currentMediaIndex + 1}`}
                            className="w-full h-full object-contain cursor-pointer"
                            onClick={() => setShowFullScreen(true)}
                          />
                        )}
                      </motion.div>
                    </AnimatePresence>

                    {/* Navigation Arrows */}
                    {hasMultipleMedia && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={prevMedia}
                          className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full"
                        >
                          <ChevronLeft className="h-6 w-6" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={nextMedia}
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full"
                        >
                          <ChevronRight className="h-6 w-6" />
                        </Button>
                      </>
                    )}

                    {/* Dots Indicator */}
                    {hasMultipleMedia && (
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                        {mediaUrls.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentMediaIndex(index)}
                            className={`w-2 h-2 rounded-full transition-all ${
                              index === currentMediaIndex
                                ? 'bg-white w-6'
                                : 'bg-white/50 hover:bg-white/75'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="aspect-square bg-zinc-900 flex items-center justify-center">
                    <div className="text-gray-500 text-center">
                      <p className="text-lg mb-2">No media</p>
                    </div>
                  </div>
                )}
              </Card>
            </motion.div>

            {/* Content Section */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-4"
            >
              {/* User Info */}
              <Card className="bg-zinc-900/80 backdrop-blur-xl border-zinc-800/50 shadow-2xl">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    {entry.userId?.username ? (
                      <Link to={`/u/${entry.userId.username}`}>
                        <Avatar className="h-10 w-10 border-2 border-purple-500/50">
                          <AvatarImage src={entry.userId?.profileImage} />
                          <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white">
                            {entry.userId.username.charAt(0).toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                      </Link>
                    ) : (
                      <Avatar className="h-10 w-10 border-2 border-purple-500/50">
                        <AvatarImage src={entry.userId?.profileImage} />
                        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white">
                          {entry.userId?.username?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div className="flex-1">
                      {entry.userId?.username ? (
                        <Link to={`/u/${entry.userId.username}`}>
                          <p className="text-white font-semibold hover:text-purple-400 transition-colors">
                            {entry.userId?.fullName || entry.userId.username || 'User'}
                          </p>
                        </Link>
                      ) : (
                        <p className="text-white font-semibold">
                          {entry.userId?.fullName || entry.userId?.username || 'User'}
                        </p>
                      )}
                      <p className="text-xs text-gray-400">
                        {format(new Date(entry.createdAt), 'MMM d, yyyy • h:mm a')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {entry.visibility && visibilityIcons[entry.visibility] && (
                        <div className="flex items-center gap-1 text-gray-400 text-xs">
                          {(() => {
                            const IconComponent = visibilityIcons[entry.visibility!].icon;
                            return <IconComponent className="h-4 w-4" />;
                          })()}
                          <span>{visibilityIcons[entry.visibility].label}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Post Content */}
              <Card className="bg-zinc-900/80 backdrop-blur-xl border-zinc-800/50 shadow-2xl">
                <CardContent className="p-6 space-y-4">
                  {entry.title && (
                    <h2 className="text-2xl font-bold text-white">{entry.title}</h2>
                  )}
                  <p className="text-gray-300 whitespace-pre-wrap">{entry.content}</p>
                  {entry.description && (
                    <p className="text-gray-400 text-sm">{entry.description}</p>
                  )}

                  {/* Mood & Tags */}
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    {entry.mood && (
                      <span className="text-2xl">{moodEmojis[entry.mood]}</span>
                    )}
                    {entry.tags && entry.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {entry.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              {canInteract() && (
                <Card className="bg-zinc-900/80 backdrop-blur-xl border-zinc-800/50 shadow-2xl">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-6">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleLike}
                        disabled={liking}
                        className={`${
                          entry.isLiked
                            ? 'text-red-500 hover:text-red-400'
                            : 'text-gray-400 hover:text-red-500'
                        }`}
                      >
                        <Heart
                          className={`h-6 w-6 ${entry.isLiked ? 'fill-current' : ''}`}
                        />
                      </Button>
                      <span className="text-white font-semibold">
                        {entry.likesCount || 0} likes
                      </span>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-gray-400 hover:text-blue-400"
                      >
                        <MessageCircle className="h-6 w-6" />
                      </Button>
                      <span className="text-white font-semibold">
                        {entry.commentsCount || 0} comments
                      </span>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-gray-400 hover:text-green-400 ml-auto"
                      >
                        <Share2 className="h-6 w-6" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Comments Section */}
              {canInteract() && (
                <Card className="bg-zinc-900/80 backdrop-blur-xl border-zinc-800/50 shadow-2xl">
                  <CardHeader>
                    <CardTitle className="text-white">Comments</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Comment Input */}
                    <div className="flex gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={currentUser?.avatarUrl} />
                        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white text-xs">
                          {currentUser?.username?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 flex gap-2">
                        <Input
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          placeholder="Add a comment..."
                          className="bg-zinc-800 text-white placeholder:text-gray-500"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleComment();
                            }
                          }}
                        />
                        <Button
                          onClick={handleComment}
                          disabled={!commentText.trim() || commenting}
                          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                        >
                          {commenting ? 'Posting...' : 'Post'}
                        </Button>
                      </div>
                    </div>

                    {/* Comments List */}
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {comments.length === 0 ? (
                        <p className="text-gray-400 text-center py-4">No comments yet</p>
                      ) : (
                        comments.map((comment) => (
                          <div key={comment._id} className="flex gap-3">
                            {comment.userId?.username ? (
                              <Link to={`/u/${comment.userId.username}`}>
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={comment.userId.profileImage} />
                                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white text-xs">
                                    {comment.userId.username.charAt(0).toUpperCase() || 'U'}
                                  </AvatarFallback>
                                </Avatar>
                              </Link>
                            ) : (
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={comment.userId.profileImage} />
                                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white text-xs">
                                  {comment.userId.username?.charAt(0).toUpperCase() || 'U'}
                                </AvatarFallback>
                              </Avatar>
                            )}
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                {comment.userId?.username ? (
                                  <Link to={`/u/${comment.userId.username}`}>
                                    <span className="text-white font-semibold text-sm hover:text-purple-400 transition-colors">
                                      {comment.userId.fullName || comment.userId.username}
                                    </span>
                                  </Link>
                                ) : (
                                  <span className="text-white font-semibold text-sm">
                                    {comment.userId.fullName || comment.userId.username}
                                  </span>
                                )}
                                <span className="text-gray-400 text-xs">
                                  {format(new Date(comment.createdAt), 'MMM d, yyyy')}
                                </span>
                              </div>
                              <p className="text-gray-300 text-sm">{comment.content}</p>
                              {(isOwner || comment.userId._id?.toString() === currentUser?.id) && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteComment(comment._id)}
                                  className="text-red-400 hover:text-red-300 text-xs mt-1 h-auto p-0"
                                >
                                  Delete
                                </Button>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Full Screen Modal */}
      <Dialog open={showFullScreen} onOpenChange={setShowFullScreen}>
        <DialogContent className="max-w-7xl w-full h-[90vh] p-0 bg-black border-none">
          <div className="relative w-full h-full flex items-center justify-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowFullScreen(false)}
              className="absolute top-4 right-4 z-50 text-white hover:bg-white/20"
            >
              <X className="h-6 w-6" />
            </Button>
            {hasMultipleMedia && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={prevMedia}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full z-50"
                >
                  <ChevronLeft className="h-8 w-8" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={nextMedia}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full z-50"
                >
                  <ChevronRight className="h-8 w-8" />
                </Button>
              </>
            )}
            <img
              src={mediaUrls[currentMediaIndex]}
              alt={`Media ${currentMediaIndex + 1}`}
              className="max-w-full max-h-full object-contain"
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-white">Delete Entry</DialogTitle>
          </DialogHeader>
          <p className="text-gray-300 mb-4">
            Are you sure you want to delete this entry? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              onClick={() => setShowDeleteDialog(false)}
              className="text-white hover:bg-zinc-800"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setShowDeleteDialog(false);
                handleDeleteEntry();
              }}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}