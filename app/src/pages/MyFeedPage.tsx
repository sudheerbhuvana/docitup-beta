import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { entriesAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  ChevronLeft, 
  ChevronRight,
  Search,
  Lock,
  Users,
  Globe,
  Plus,
  Edit
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface FeedEntry {
  _id: string;
  title?: string;
  content: string;
  description?: string;
  createdAt: string;
  mood?: 'great' | 'good' | 'okay' | 'bad' | 'terrible';
  tags?: string[];
  mediaUrls?: string[];
  visibility?: 'private' | 'followers' | 'public';
  isLiked?: boolean;
  likesCount?: number;
  commentsCount?: number;
  userId?: {
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

export default function MyFeedPage() {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [feed, setFeed] = useState<FeedEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentMediaIndices, setCurrentMediaIndices] = useState<Record<string, number>>({});
  const [liking, setLiking] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (currentUser) {
      fetchMyFeed();
    }
  }, [currentUser]);

  const fetchMyFeed = async () => {
    if (!currentUser) return;
    
    try {
      const response = await entriesAPI.getAll({ 
        userId: currentUser.id,
        limit: 50 
      });
      setFeed(response.data.entries || []);
      // Initialize media indices
      const indices: Record<string, number> = {};
      (response.data.entries || []).forEach((entry: FeedEntry) => {
        indices[entry._id] = 0;
      });
      setCurrentMediaIndices(indices);
    } catch (error: any) {
      console.error('Error fetching my feed:', error);
      toast.error(error.response?.data?.error || 'Failed to load your posts');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (entryId: string) => {
    if (!currentUser) {
      toast.error('Please log in to like posts');
      return;
    }

    setLiking({ ...liking, [entryId]: true });
    try {
      const response = await entriesAPI.toggleLike(entryId);
      setFeed(feed.map(entry => 
        entry._id === entryId 
          ? { ...entry, isLiked: response.data.liked, likesCount: response.data.likesCount }
          : entry
      ));
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to like post');
    } finally {
      setLiking({ ...liking, [entryId]: false });
    }
  };

  const nextMedia = (entryId: string) => {
    const entry = feed.find(e => e._id === entryId);
    if (entry?.mediaUrls && entry.mediaUrls.length > 0) {
      setCurrentMediaIndices({
        ...currentMediaIndices,
        [entryId]: ((currentMediaIndices[entryId] || 0) + 1) % entry.mediaUrls!.length
      });
    }
  };

  const prevMedia = (entryId: string) => {
    const entry = feed.find(e => e._id === entryId);
    if (entry?.mediaUrls && entry.mediaUrls.length > 0) {
      const currentIndex = currentMediaIndices[entryId] || 0;
      const newIndex = (currentIndex - 1 + entry.mediaUrls!.length) % entry.mediaUrls!.length;
      setCurrentMediaIndices({
        ...currentMediaIndices,
        [entryId]: newIndex
      });
    }
  };

  const filteredFeed = feed.filter(entry => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      entry.content?.toLowerCase().includes(query) ||
      entry.title?.toLowerCase().includes(query) ||
      entry.tags?.some(tag => tag.toLowerCase().includes(query)) ||
      entry.mood?.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading your posts...</div>
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

      <div className="relative z-10 p-4 md:p-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Header */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white">My Posts</h1>
                <p className="text-gray-400 mt-2">Your personal feed</p>
              </div>
              <Button
                onClick={() => navigate('/journal/new')}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Post
              </Button>
            </div>
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search your posts, tags, or mood..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-zinc-900/80 border-zinc-800 text-white placeholder:text-gray-500"
              />
            </div>
          </div>

          {/* Feed */}
          {filteredFeed.length === 0 ? (
            <Card className="bg-zinc-900/80 backdrop-blur-xl border-zinc-800/50 shadow-2xl">
              <CardContent className="p-12 text-center">
                <p className="text-gray-400 mb-4">
                  {searchQuery ? 'No posts found matching your search' : 'You haven\'t created any posts yet'}
                </p>
                {!searchQuery && (
                  <Button
                    onClick={() => navigate('/journal/new')}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Post
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {filteredFeed.map((entry) => {
                const mediaUrls = entry.mediaUrls || [];
                const hasMultipleMedia = mediaUrls.length > 1;
                const currentMediaIndex = currentMediaIndices[entry._id] || 0;

                return (
                  <motion.div
                    key={entry._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="bg-zinc-900/80 backdrop-blur-xl border-zinc-800/50 shadow-2xl overflow-hidden">
                      {/* Header */}
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-4">
                          <Link to="/profile">
                            <Avatar className="h-10 w-10 border-2 border-purple-500/50">
                              <AvatarImage src={currentUser?.avatarUrl} />
                              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white">
                                {currentUser?.username?.charAt(0).toUpperCase() || 'U'}
                              </AvatarFallback>
                            </Avatar>
                          </Link>
                          <div className="flex-1">
                            <Link to="/profile">
                              <p className="text-white font-semibold hover:text-purple-400 transition-colors">
                                {currentUser?.fullName || currentUser?.username || 'You'}
                              </p>
                            </Link>
                            <p className="text-xs text-gray-400">
                              {format(new Date(entry.createdAt), 'MMM d, yyyy • h:mm a')}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {entry.visibility && visibilityIcons[entry.visibility] && (() => {
                              const visibilityInfo = visibilityIcons[entry.visibility];
                              if (!visibilityInfo || !visibilityInfo.icon) return null;
                              const IconComponent = visibilityInfo.icon;
                              return (
                                <div className="flex items-center gap-1 text-gray-400 text-xs">
                                  <IconComponent className="h-4 w-4" />
                                </div>
                              );
                            })()}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => navigate(`/journal/${entry._id}/edit`)}
                              className="text-gray-400 hover:text-purple-400"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Media Carousel */}
                        {mediaUrls.length > 0 && (
                          <div className="relative mb-4 rounded-lg overflow-hidden bg-black">
                            <div className="aspect-square relative">
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
                                    />
                                  ) : (
                                    <img
                                      src={mediaUrls[currentMediaIndex]}
                                      alt={`Media ${currentMediaIndex + 1}`}
                                      className="w-full h-full object-contain cursor-pointer"
                                      onClick={() => navigate(`/journal/${entry._id}`)}
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
                                    onClick={() => prevMedia(entry._id)}
                                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full"
                                  >
                                    <ChevronLeft className="h-6 w-6" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => nextMedia(entry._id)}
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
                                      onClick={() => setCurrentMediaIndices({ ...currentMediaIndices, [entry._id]: index })}
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
                          </div>
                        )}

                        {/* Content */}
                        <div className="space-y-3">
                          {entry.title && (
                            <h3 className="text-xl font-bold text-white">{entry.title}</h3>
                          )}
                          <p className="text-gray-300 whitespace-pre-wrap">{entry.content}</p>
                          {entry.description && (
                            <p className="text-gray-400 text-sm">{entry.description}</p>
                          )}

                          {/* Mood & Tags */}
                          <div className="flex flex-wrap items-center gap-3">
                            {entry.mood && (
                              <span className="text-2xl">{moodEmojis[entry.mood]}</span>
                            )}
                            {entry.tags && entry.tags.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {entry.tags.map((tag) => (
                                  <span
                                    key={tag}
                                    className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs cursor-pointer hover:bg-purple-500/30"
                                    onClick={() => setSearchQuery(`#${tag}`)}
                                  >
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-6 pt-2 border-t border-zinc-800">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleLike(entry._id)}
                              disabled={liking[entry._id]}
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
                            <span className="text-white font-semibold text-sm">
                              {entry.likesCount || 0} likes
                            </span>

                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => navigate(`/journal/${entry._id}`)}
                              className="text-gray-400 hover:text-blue-400"
                            >
                              <MessageCircle className="h-6 w-6" />
                            </Button>
                            <span className="text-white font-semibold text-sm">
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
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

