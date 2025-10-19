import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { profileAPI, entriesAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ArrowLeft, User, MapPin, Link as LinkIcon, Calendar, FileText, Twitter, Instagram, Linkedin, Users, UserPlus, UserMinus } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface PublicProfile {
  _id: string;
  username?: string;
  fullName?: string;
  bio?: string;
  profileImage?: string;
  location?: string;
  website?: string;
  socialLinks?: {
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
  createdAt?: string;
  publicEntriesCount?: number;
  followersCount?: number;
  followingCount?: number;
  followers?: any[];
  following?: any[];
}

export default function PublicProfilePage() {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [entries, setEntries] = useState<any[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loadingFollow, setLoadingFollow] = useState(false);

  useEffect(() => {
    if (username) {
      fetchProfile();
    }
  }, [username]);

  const fetchProfile = async () => {
    try {
      const response = await profileAPI.getPublicProfile(username!);
      const userData = response.data.user;
      setProfile(userData);
      
      // Check if current user is following this profile
      if (currentUser && userData.followers) {
        const following = userData.followers.some((f: any) => f._id?.toString() === currentUser.id);
        setIsFollowing(following);
      }

      // Fetch public entries
      if (userData._id) {
        try {
          const entriesResponse = await entriesAPI.getAll({
            userId: userData._id,
            privacy: 'public',
            limit: 10,
          });
          setEntries(entriesResponse.data.entries || []);
        } catch (error) {
          console.error('Error fetching entries:', error);
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Profile not found or not public');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!profile || !currentUser) {
      toast.error('Please login to follow users');
      return;
    }

    setLoadingFollow(true);
    try {
      if (isFollowing) {
        await profileAPI.unfollowUser(profile._id);
        setIsFollowing(false);
        toast.success('Unfollowed successfully');
      } else {
        await profileAPI.followUser(profile._id);
        setIsFollowing(true);
        toast.success('Following successfully');
      }
      // Refresh profile to update follower count
      fetchProfile();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to follow/unfollow');
    } finally {
      setLoadingFollow(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black p-6 md:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-10 w-48" />
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardContent className="p-6">
              <div className="flex items-center gap-6">
                <Skeleton className="h-32 w-32 rounded-full" />
                <div className="flex-1 space-y-4">
                  <Skeleton className="h-8 w-48" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-black p-6 md:p-8">
        <div className="max-w-4xl mx-auto">
          <Alert variant="destructive">
            <AlertTitle>Profile Not Found</AlertTitle>
            <AlertDescription>
              This profile is not available or is set to private.
            </AlertDescription>
          </Alert>
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
          </motion.div>

          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="bg-zinc-900/80 backdrop-blur-xl border-zinc-800/50 shadow-2xl">
              <CardContent className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    {profile.profileImage ? (
                      <Avatar className="h-32 w-32 border-4 border-purple-500/50">
                        <AvatarImage src={profile.profileImage} alt={profile.fullName || profile.username} />
                        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white text-4xl">
                          {profile.username?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="h-32 w-32 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-4xl font-bold border-4 border-purple-500/50">
                        {profile.username?.charAt(0).toUpperCase() || 'U'}
                      </div>
                    )}
                  </div>

                  {/* Profile Info */}
                  <div className="flex-1 space-y-4">
                    <div>
                      <h1 className="text-3xl font-bold text-white mb-2">
                        {profile.fullName || profile.username}
                      </h1>
                      {profile.username && (
                        <p className="text-gray-400 flex items-center gap-2">
                          <User className="h-4 w-4" />
                          @{profile.username}
                        </p>
                      )}
                    </div>

                    {profile.bio && (
                      <p className="text-gray-300">{profile.bio}</p>
                    )}

                    {/* Stats */}
                    <div className="flex gap-6 pt-2">
                      <div className="flex items-center gap-2 text-gray-400">
                        <FileText className="h-4 w-4" />
                        <span className="text-white font-semibold">{profile.publicEntriesCount || 0}</span>
                        <span>Entries</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-400">
                        <Users className="h-4 w-4" />
                        <span className="text-white font-semibold">{profile.followersCount || 0}</span>
                        <span>Followers</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-400">
                        <UserPlus className="h-4 w-4" />
                        <span className="text-white font-semibold">{profile.followingCount || 0}</span>
                        <span>Following</span>
                      </div>
                    </div>

                    {/* Additional Info */}
                    <div className="flex flex-wrap gap-4 pt-2">
                      {profile.location && (
                        <div className="flex items-center gap-2 text-gray-400 text-sm">
                          <MapPin className="h-4 w-4" />
                          {profile.location}
                        </div>
                      )}
                      {profile.website && (
                        <a
                          href={profile.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm"
                        >
                          <LinkIcon className="h-4 w-4" />
                          {profile.website.replace(/^https?:\/\//, '')}
                        </a>
                      )}
                      {profile.createdAt && (
                        <div className="flex items-center gap-2 text-gray-400 text-sm">
                          <Calendar className="h-4 w-4" />
                          Joined {new Date(profile.createdAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>

                    {/* Social Links */}
                    {(profile.socialLinks?.twitter || profile.socialLinks?.instagram || profile.socialLinks?.linkedin) && (
                      <div className="flex gap-4 pt-2">
                        {profile.socialLinks.twitter && (
                          <a
                            href={`https://twitter.com/${profile.socialLinks.twitter.replace('@', '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-blue-400 transition-colors"
                          >
                            <Twitter className="h-5 w-5" />
                          </a>
                        )}
                        {profile.socialLinks.instagram && (
                          <a
                            href={`https://instagram.com/${profile.socialLinks.instagram.replace('@', '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-pink-400 transition-colors"
                          >
                            <Instagram className="h-5 w-5" />
                          </a>
                        )}
                        {profile.socialLinks.linkedin && (
                          <a
                            href={`https://linkedin.com/in/${profile.socialLinks.linkedin.replace('linkedin.com/in/', '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-blue-500 transition-colors"
                          >
                            <Linkedin className="h-5 w-5" />
                          </a>
                        )}
                      </div>
                    )}

                    {/* Follow Button */}
                    {currentUser && currentUser.id !== profile._id && (
                      <div className="pt-2">
                        <Button
                          onClick={handleFollow}
                          disabled={loadingFollow}
                          variant={isFollowing ? 'outline' : 'default'}
                          className={isFollowing 
                            ? 'border-zinc-700 text-white hover:bg-zinc-800' 
                            : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white'
                          }
                        >
                          {isFollowing ? (
                            <>
                              <UserMinus className="h-4 w-4 mr-2" />
                              Unfollow
                            </>
                          ) : (
                            <>
                              <UserPlus className="h-4 w-4 mr-2" />
                              Follow
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Public Entries */}
          {entries.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="bg-zinc-900/80 backdrop-blur-xl border-zinc-800/50 shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Public Entries
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {entries.map((entry) => (
                      <Link
                        key={entry._id}
                        to={`/journal/${entry._id}`}
                        className="block p-4 bg-zinc-800/50 rounded-lg hover:bg-zinc-800 transition-colors"
                      >
                        <h3 className="text-white font-semibold mb-2">{entry.title || 'Untitled Entry'}</h3>
                        <p className="text-gray-400 text-sm line-clamp-2">
                          {entry.content}
                        </p>
                        {entry.createdAt && (
                          <p className="text-gray-500 text-xs mt-2">
                            {new Date(entry.createdAt).toLocaleDateString()}
                          </p>
                        )}
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}