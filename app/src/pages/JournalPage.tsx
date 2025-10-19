import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { entriesAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Calendar, FileText, Search, Filter, X, Grid3x3, List, Lock, Users, Globe } from 'lucide-react';
import { format } from 'date-fns';
import { MoodSelector, type MoodValue } from '@/components/ui/mood-selector';

interface Entry {
  _id: string;
  title?: string;
  content: string;
  createdAt: string;
  mood?: MoodValue;
  tags?: string[];
  media?: string[];
  mediaUrls?: string[];
  privacy?: 'private' | 'friends' | 'public';
  isDraft?: boolean;
}

const moodEmojis: Record<string, string> = {
  great: '😄',
  good: '😊',
  okay: '😐',
  bad: '😔',
  terrible: '😢',
};

export default function JournalPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMood, setSelectedMood] = useState<MoodValue | ''>('');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [selectedPrivacy, setSelectedPrivacy] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    const token = localStorage.getItem('token');
    
    // Demo mode - use mock data
    if (token === 'demo-token') {
      setEntries([
        { 
          _id: '1', 
          title: 'Welcome to Docitup', 
          content: 'This is your first entry. Start documenting your journey with images, videos, and tags!', 
          createdAt: new Date().toISOString(), 
          mood: 'great',
          tags: ['welcome', 'first-entry', 'journey'],
          media: [],
          privacy: 'private',
        },
        { 
          _id: '2', 
          title: 'Today\'s Reflection', 
          content: 'A beautiful day to reflect on growth and progress. Captured some amazing moments!', 
          createdAt: new Date(Date.now() - 86400000).toISOString(), 
          mood: 'good',
          tags: ['reflection', 'growth', 'gratitude'],
          media: [],
          privacy: 'public',
        },
        { 
          _id: '3', 
          title: 'Weekend Thoughts', 
          content: 'Spent time thinking about goals and aspirations for the coming months. Excited for what\'s ahead!', 
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          tags: ['weekend', 'goals', 'future'],
          media: [],
          privacy: 'private',
        },
      ]);
      setLoading(false);
      return;
    }
    
    try {
      const response = await entriesAPI.getAll({ limit: 100 });
      setEntries(response.data.entries || []);
    } catch (error) {
      console.error('Error fetching entries:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get all unique tags from entries
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    entries.forEach(entry => {
      entry.tags?.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [entries]);

  // Filter entries
  const filteredEntries = useMemo(() => {
    return entries.filter(entry => {
      // Skip drafts
      if (entry.isDraft) return false;

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = entry.title?.toLowerCase().includes(query);
        const matchesContent = entry.content.toLowerCase().includes(query);
        const matchesTags = entry.tags?.some(tag => tag.toLowerCase().includes(query));
        if (!matchesTitle && !matchesContent && !matchesTags) return false;
      }

      // Mood filter
      if (selectedMood && entry.mood !== selectedMood) return false;

      // Tag filter
      if (selectedTag && !entry.tags?.includes(selectedTag)) return false;

      // Privacy filter
      if (selectedPrivacy !== 'all' && entry.privacy !== selectedPrivacy) return false;

      return true;
    });
  }, [entries, searchQuery, selectedMood, selectedTag, selectedPrivacy]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedMood('');
    setSelectedTag('');
    setSelectedPrivacy('all');
  };

  const hasActiveFilters = searchQuery || selectedMood || selectedTag || selectedPrivacy !== 'all';

  if (loading) {
    return (
      <div className="p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="p-6">
                <Skeleton className="h-6 w-3/4 mb-4" />
                <Skeleton className="h-32 w-full mb-4" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
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

      <div className="relative z-10 p-6 md:p-8 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">Journal</h1>
            <p className="text-gray-400">Your personal documentation space</p>
          </div>
          <Button asChild size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
            <Link to="/journal/new">
              <Plus className="mr-2 h-4 w-4" />
              New Entry
            </Link>
          </Button>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-4"
        >
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search entries by title, content, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-zinc-900/80 backdrop-blur-xl border-zinc-800 text-white placeholder:text-gray-500"
              />
            </div>

            {/* View Mode Toggle */}
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('grid')}
                className="bg-zinc-900/80 border-zinc-800"
              >
                <Grid3x3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('list')}
                className="bg-zinc-900/80 border-zinc-800"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={showFilters ? 'default' : 'outline'}
                size="icon"
                onClick={() => setShowFilters(!showFilters)}
                className="bg-zinc-900/80 border-zinc-800"
              >
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-xl p-6 space-y-4"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filters
                </h3>
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Clear All
                  </Button>
                )}
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                {/* Mood Filter */}
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">Mood</label>
                  <MoodSelector
                    value={selectedMood}
                    onChange={setSelectedMood}
                  />
                </div>

                {/* Tag Filter */}
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">Tag</label>
                  <Select value={selectedTag} onValueChange={setSelectedTag}>
                    <SelectTrigger className="w-full bg-zinc-800 border-zinc-700 text-white">
                      <SelectValue placeholder="All tags" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All tags</SelectItem>
                      {allTags.map((tag) => (
                        <SelectItem key={tag} value={tag}>
                          #{tag}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Privacy Filter */}
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">Privacy</label>
                  <Select value={selectedPrivacy} onValueChange={setSelectedPrivacy}>
                    <SelectTrigger className="w-full bg-zinc-800 border-zinc-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All entries</SelectItem>
                      <SelectItem value="private">
                        <span className="flex items-center gap-2">
                          <Lock className="h-4 w-4" />
                          Private
                        </span>
                      </SelectItem>
                      <SelectItem value="friends">
                        <span className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Friends Only
                        </span>
                      </SelectItem>
                      <SelectItem value="public">
                        <span className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          Public
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </motion.div>
          )}

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2">
              {searchQuery && (
                <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm flex items-center gap-2">
                  Search: "{searchQuery}"
                  <button onClick={() => setSearchQuery('')} className="hover:text-purple-200">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {selectedMood && (
                <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm flex items-center gap-2">
                  Mood: {moodEmojis[selectedMood]} {selectedMood}
                  <button onClick={() => setSelectedMood('')} className="hover:text-blue-200">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {selectedTag && (
                <span className="px-3 py-1 bg-pink-500/20 text-pink-300 rounded-full text-sm flex items-center gap-2">
                  Tag: #{selectedTag}
                  <button onClick={() => setSelectedTag('')} className="hover:text-pink-200">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {selectedPrivacy !== 'all' && (
                <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm flex items-center gap-2">
                  Privacy: {selectedPrivacy}
                  <button onClick={() => setSelectedPrivacy('all')} className="hover:text-green-200">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
            </div>
          )}
        </motion.div>

        {/* Results Count */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-sm text-gray-400"
        >
          Showing {filteredEntries.length} of {entries.length} entries
        </motion.div>

        {/* Entries Grid/List */}
        {filteredEntries.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="bg-zinc-900/80 backdrop-blur-xl border-zinc-800/50 shadow-2xl">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <FileText className="h-16 w-16 text-gray-600 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  {hasActiveFilters ? 'No entries match your filters' : 'No entries yet'}
                </h3>
                <p className="text-gray-400 text-sm mb-6 text-center max-w-md">
                  {hasActiveFilters
                    ? 'Try adjusting your filters to see more entries'
                    : 'Start documenting your life journey with your first entry'}
                </p>
                {hasActiveFilters ? (
                  <Button variant="outline" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                ) : (
                  <Button asChild>
                    <Link to="/journal/new">Create Your First Entry</Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className={
              viewMode === 'grid'
                ? 'grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                : 'space-y-4'
            }
          >
            {filteredEntries.map((entry, index) => (
              <motion.div
                key={entry._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.05 * index }}
              >
                <Link to={`/journal/${entry._id}`}>
                  <Card className="bg-zinc-900/80 backdrop-blur-xl border-zinc-800/50 shadow-2xl hover:border-purple-500/50 transition-all duration-300 hover:scale-[1.02] cursor-pointer h-full group">
                    {viewMode === 'grid' ? (
                      <>
                        {entry.mediaUrls && entry.mediaUrls.length > 0 && (
                          <div className="relative w-full aspect-video rounded-t-lg overflow-hidden bg-zinc-800">
                            <img
                              src={entry.mediaUrls[0]}
                              alt={entry.title || 'Entry'}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                            {entry.mediaUrls.length > 1 && (
                              <div className="absolute top-2 right-2 px-2 py-1 bg-black/70 backdrop-blur-sm rounded-full text-xs font-medium text-white">
                                +{entry.mediaUrls.length - 1}
                              </div>
                            )}
                            {entry.privacy && (
                              <div className="absolute top-2 left-2">
                                {entry.privacy === 'private' && (
                                  <Lock className="h-4 w-4 text-white bg-black/50 rounded-full p-1" />
                                )}
                                {entry.privacy === 'friends' && (
                                  <Users className="h-4 w-4 text-white bg-black/50 rounded-full p-1" />
                                )}
                                {entry.privacy === 'public' && (
                                  <Globe className="h-4 w-4 text-white bg-black/50 rounded-full p-1" />
                                )}
                              </div>
                            )}
                          </div>
                        )}
                        <CardHeader>
                          <div className="flex items-start justify-between gap-2">
                            <CardTitle className="text-lg font-semibold text-white line-clamp-2 group-hover:text-purple-400 transition-colors">
                              {entry.title || 'Untitled Entry'}
                            </CardTitle>
                            {entry.mood && (
                              <span className="text-2xl flex-shrink-0">
                                {moodEmojis[entry.mood]}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(entry.createdAt), 'MMM d, yyyy')}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-gray-400 line-clamp-3 mb-3 leading-relaxed">
                            {entry.content}
                          </p>
                          {entry.tags && entry.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              {entry.tags.slice(0, 3).map((tag) => (
                                <span
                                  key={tag}
                                  className="text-xs px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded-full"
                                >
                                  #{tag}
                                </span>
                              ))}
                              {entry.tags.length > 3 && (
                                <span className="text-xs px-2 py-0.5 bg-zinc-800 text-gray-400 rounded-full">
                                  +{entry.tags.length - 3}
                                </span>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </>
                    ) : (
                      <CardContent className="p-6">
                        <div className="flex gap-4">
                          {entry.mediaUrls && entry.mediaUrls.length > 0 && (
                            <div className="relative w-32 h-32 rounded-lg overflow-hidden bg-zinc-800 flex-shrink-0">
                              <img
                                src={entry.mediaUrls[0]}
                                alt={entry.title || 'Entry'}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <CardTitle className="text-xl font-semibold text-white group-hover:text-purple-400 transition-colors">
                                {entry.title || 'Untitled Entry'}
                              </CardTitle>
                              {entry.mood && (
                                <span className="text-2xl flex-shrink-0">
                                  {moodEmojis[entry.mood]}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-4 mb-3 text-sm text-gray-400">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {format(new Date(entry.createdAt), 'MMM d, yyyy')}
                              </span>
                              {entry.privacy && (
                                <span className="flex items-center gap-1">
                                  {entry.privacy === 'private' && <Lock className="h-4 w-4" />}
                                  {entry.privacy === 'friends' && <Users className="h-4 w-4" />}
                                  {entry.privacy === 'public' && <Globe className="h-4 w-4" />}
                                  <span className="capitalize">{entry.privacy}</span>
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-400 line-clamp-2 mb-3 leading-relaxed">
                              {entry.content}
                            </p>
                            {entry.tags && entry.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1.5">
                                {entry.tags.map((tag) => (
                                  <span
                                    key={tag}
                                    className="text-xs px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded-full"
                                  >
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
