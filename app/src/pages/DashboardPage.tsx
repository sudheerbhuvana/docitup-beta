import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { entriesAPI, goalsAPI } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dock, DockIcon } from '@/components/ui/dock';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  BookOpen, 
  Target, 
  TrendingUp, 
  Plus, 
  Image as ImageIcon,
  Calendar,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

interface Entry {
  _id: string;
  title?: string;
  content: string;
  createdAt: string;
  mood?: 'great' | 'good' | 'okay' | 'bad' | 'terrible';
  tags?: string[];
  media?: string[];
  mediaUrls?: string[];
}

interface Goal {
  _id: string;
  title: string;
  description?: string;
  progressPercentage: number;
  status: string;
  targetDate?: string;
  category?: string;
}

interface DashboardStats {
  totalEntries: number;
  activeGoals: number;
  thisMonthEntries: number;
  moodTrend: 'up' | 'down' | 'stable';
  averageMood?: string;
}

const motivationalQuotes = [
  "Every journey begins with a single step. Keep moving forward!",
  "Your progress, no matter how small, is still progress.",
  "Today is a new opportunity to grow and learn.",
  "You are capable of amazing things. Believe in yourself!",
  "Small steps lead to big achievements.",
];

const moodEmojis: Record<string, string> = {
  great: '😄',
  good: '😊',
  okay: '😐',
  bad: '😔',
  terrible: '😢',
};

const moodColors: Record<string, string> = {
  great: 'from-green-500 to-emerald-500',
  good: 'from-blue-500 to-cyan-500',
  okay: 'from-yellow-500 to-orange-500',
  bad: 'from-orange-500 to-red-500',
  terrible: 'from-red-500 to-rose-500',
};

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recentEntries, setRecentEntries] = useState<Entry[]>([]);
  const [activeGoals, setActiveGoals] = useState<Goal[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalEntries: 0,
    activeGoals: 0,
    thisMonthEntries: 0,
    moodTrend: 'stable',
  });
  const [loading, setLoading] = useState(true);
  const [moodData, setMoodData] = useState<{ date: string; mood: string }[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    // Demo mode - use mock data
    if (token === 'demo-token') {
      const mockEntries: Entry[] = [
        { 
          _id: '1', 
          title: 'Welcome to Docitup', 
          content: 'This is your first entry. Start documenting your journey!', 
          createdAt: new Date().toISOString(), 
          mood: 'great',
          tags: ['welcome'], 
          media: [],
          mediaUrls: []
        },
        { 
          _id: '2', 
          title: 'Today\'s Reflection', 
          content: 'A beautiful day to reflect on growth and progress.', 
          createdAt: new Date(Date.now() - 86400000).toISOString(), 
          mood: 'good',
          tags: ['reflection'], 
          media: [],
          mediaUrls: []
        },
      ];
      const mockGoals: Goal[] = [
        { _id: '1', title: 'Learn a New Skill', progressPercentage: 45, status: 'active', targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() },
        { _id: '2', title: 'Build Healthy Habits', progressPercentage: 70, status: 'active', targetDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString() },
      ];
      setRecentEntries(mockEntries);
      setActiveGoals(mockGoals);
      setStats({
        totalEntries: 12,
        activeGoals: 2,
        thisMonthEntries: 8,
        moodTrend: 'up',
        averageMood: 'good',
      });
      setMoodData([
        { date: format(new Date(), 'MMM d'), mood: 'great' },
        { date: format(new Date(Date.now() - 86400000), 'MMM d'), mood: 'good' },
        { date: format(new Date(Date.now() - 172800000), 'MMM d'), mood: 'okay' },
        { date: format(new Date(Date.now() - 259200000), 'MMM d'), mood: 'good' },
        { date: format(new Date(Date.now() - 345600000), 'MMM d'), mood: 'great' },
        { date: format(new Date(Date.now() - 432000000), 'MMM d'), mood: 'good' },
        { date: format(new Date(Date.now() - 518400000), 'MMM d'), mood: 'okay' },
      ]);
      setLoading(false);
      return;
    }
    
    Promise.all([
      entriesAPI.getAll({ limit: 50 }),
      goalsAPI.getAll({ status: 'active', limit: 10 }),
    ])
      .then(([entriesRes, goalsRes]) => {
        const entries = entriesRes.data.entries || [];
        const goals = goalsRes.data.goals || [];
        
        setRecentEntries(entries.slice(0, 4));
        setActiveGoals(goals.slice(0, 3));
        
        // Calculate stats
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const thisMonthEntries = entries.filter(
          (e: Entry) => new Date(e.createdAt) >= startOfMonth
        );
        
        // Calculate mood trend from last 7 days
        const last7Days = entries.filter(
          (e: Entry) => new Date(e.createdAt) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) && e.mood
        );
        const moods = last7Days.map((e: Entry) => e.mood!);
        const moodValues: Record<string, number> = { great: 5, good: 4, okay: 3, bad: 2, terrible: 1 };
        const recentAvg = moods.length > 0 
          ? moods.reduce((sum: number, m: string) => sum + moodValues[m], 0) / moods.length 
          : 0;
        const olderMoods = entries
          .filter((e: Entry) => {
            const date = new Date(e.createdAt);
            return date >= new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) && 
                   date < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) && 
                   e.mood;
          })
          .map((e: Entry) => e.mood!);
        const olderAvg = olderMoods.length > 0
          ? olderMoods.reduce((sum: number, m: string) => sum + moodValues[m], 0) / olderMoods.length
          : 0;
        
        let moodTrend: 'up' | 'down' | 'stable' = 'stable';
        if (recentAvg > olderAvg + 0.3) moodTrend = 'up';
        else if (recentAvg < olderAvg - 0.3) moodTrend = 'down';
        
        // Get average mood
        const avgMoodValue = recentAvg || olderAvg || 3;
        const averageMood = Object.entries(moodValues).find(
          ([_, val]) => Math.abs(val - avgMoodValue) < 0.5
        )?.[0] || 'okay';
        
        // Generate mood timeline data
        const moodTimeline = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
          const dayEntries = entries.filter(
            (e: Entry) => {
              const entryDate = new Date(e.createdAt);
              return entryDate.toDateString() === date.toDateString() && e.mood;
            }
          );
          const dayMood = dayEntries.length > 0 ? dayEntries[0].mood! : null;
          if (dayMood) {
            moodTimeline.push({ date: format(date, 'MMM d'), mood: dayMood });
          }
        }
        setMoodData(moodTimeline);
        
        setStats({
          totalEntries: entries.length,
          activeGoals: goals.length,
          thisMonthEntries: thisMonthEntries.length,
          moodTrend,
          averageMood,
        });
      })
      .catch((error) => {
        console.error('Error fetching dashboard data:', error);
      })
      .finally(() => setLoading(false));
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];

  if (loading) {
    return (
      <div className="p-6 md:p-8 space-y-8">
        <div className="space-y-4">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-6 w-96" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="p-6">
                <Skeleton className="h-8 w-24 mb-2" />
                <Skeleton className="h-4 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardContent className="p-6">
              <Skeleton className="h-6 w-32 mb-4" />
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardContent className="p-6">
              <Skeleton className="h-6 w-32 mb-4" />
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
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

      <div className="relative z-10 p-6 md:p-8 space-y-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-4"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                {getGreeting()}, {user?.fullName?.split(' ')[0] || user?.username || 'there'}! 👋
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <p className="text-lg text-gray-300 italic">{randomQuote}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
        >
          <Card className="bg-zinc-900/80 backdrop-blur-xl border-zinc-800/50 shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 hover:scale-[1.02]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Total Entries</CardTitle>
              <BookOpen className="h-5 w-5 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white mb-1">{stats.totalEntries}</div>
              <p className="text-xs text-gray-400">Journal entries</p>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900/80 backdrop-blur-xl border-zinc-800/50 shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 hover:scale-[1.02]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Active Goals</CardTitle>
              <Target className="h-5 w-5 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white mb-1">{stats.activeGoals}</div>
              <p className="text-xs text-gray-400">Goals in progress</p>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900/80 backdrop-blur-xl border-zinc-800/50 shadow-2xl hover:shadow-pink-500/20 transition-all duration-300 hover:scale-[1.02]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">This Month</CardTitle>
              <Calendar className="h-5 w-5 text-pink-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white mb-1">{stats.thisMonthEntries}</div>
              <p className="text-xs text-gray-400">Entries this month</p>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900/80 backdrop-blur-xl border-zinc-800/50 shadow-2xl hover:shadow-green-500/20 transition-all duration-300 hover:scale-[1.02]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Mood Trend</CardTitle>
              <TrendingUp className={`h-5 w-5 ${
                stats.moodTrend === 'up' ? 'text-green-400' : 
                stats.moodTrend === 'down' ? 'text-red-400' : 
                'text-yellow-400'
              }`} />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-3xl font-bold text-white">
                  {stats.averageMood ? moodEmojis[stats.averageMood] : '😐'}
                </span>
                <span className="text-sm text-gray-400 capitalize">{stats.averageMood || 'N/A'}</span>
              </div>
              <p className="text-xs text-gray-400">
                {stats.moodTrend === 'up' ? 'Improving' : stats.moodTrend === 'down' ? 'Declining' : 'Stable'}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Recent Journal Entries */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <Card className="bg-zinc-900/80 backdrop-blur-xl border-zinc-800/50 shadow-2xl">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold text-white">Recent Journal Entries</CardTitle>
                  <CardDescription className="text-gray-400">Your latest reflections</CardDescription>
                </div>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/journal">
                    View All
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                {recentEntries.length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 mb-4">No entries yet. Start documenting your journey!</p>
                    <Button asChild>
                      <Link to="/journal/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Create First Entry
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {recentEntries.map((entry, index) => (
                      <motion.div
                        key={entry._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 * index }}
                      >
                        <Link to={`/journal/${entry._id}`}>
                          <Card className="bg-zinc-800/50 border-zinc-700/50 hover:border-purple-500/50 transition-all duration-300 hover:scale-[1.02] cursor-pointer h-full">
                            <CardContent className="p-4">
                              {entry.mediaUrls && entry.mediaUrls.length > 0 && (
                                <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-zinc-700/50 mb-3">
                                  <img 
                                    src={entry.mediaUrls[0]} 
                                    alt={entry.title || 'Entry'} 
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              )}
                              <div className="flex items-start justify-between mb-2">
                                <h3 className="font-semibold text-white line-clamp-1">
                                  {entry.title || 'Untitled Entry'}
                                </h3>
                                {entry.mood && (
                                  <span className="text-2xl flex-shrink-0 ml-2">
                                    {moodEmojis[entry.mood]}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-400 line-clamp-2 mb-2">
                                {entry.content}
                              </p>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500">
                                  {format(new Date(entry.createdAt), 'MMM d, yyyy')}
                                </span>
                                {entry.tags && entry.tags.length > 0 && (
                                  <div className="flex gap-1">
                                    {entry.tags.slice(0, 2).map((tag) => (
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
                            </CardContent>
                          </Card>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Active Goals */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="bg-zinc-900/80 backdrop-blur-xl border-zinc-800/50 shadow-2xl">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold text-white">Active Goals</CardTitle>
                  <CardDescription className="text-gray-400">Goals in progress</CardDescription>
                </div>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/goals">
                    View All
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                {activeGoals.length === 0 ? (
                  <div className="text-center py-12">
                    <Target className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 mb-4">No active goals. Set your first goal!</p>
                    <Button asChild>
                      <Link to="/goals/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Add New Goal
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activeGoals.map((goal, index) => {
                      const daysLeft = goal.targetDate 
                        ? differenceInDays(new Date(goal.targetDate), new Date())
                        : null;
                      
                      return (
                        <motion.div
                          key={goal._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: 0.1 * index }}
                        >
                          <Link to={`/goals/${goal._id}`}>
                            <Card className="bg-zinc-800/50 border-zinc-700/50 hover:border-blue-500/50 transition-all duration-300 hover:scale-[1.02] cursor-pointer">
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between mb-3">
                                  <h3 className="font-semibold text-white line-clamp-2 flex-1">
                                    {goal.title}
                                  </h3>
                                  <span className="text-lg font-bold text-blue-400 ml-2 flex-shrink-0">
                                    {goal.progressPercentage}%
                                  </span>
                                </div>
                                <div className="w-full bg-zinc-700/50 rounded-full h-2.5 overflow-hidden mb-2">
                                  <div
                                    className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2.5 rounded-full transition-all duration-500 ease-out"
                                    style={{ width: `${goal.progressPercentage}%` }}
                                  />
                                </div>
                                {daysLeft !== null && (
                                  <p className="text-xs text-gray-400">
                                    {daysLeft > 0 
                                      ? `${daysLeft} days left` 
                                      : daysLeft === 0 
                                        ? 'Due today' 
                                        : `${Math.abs(daysLeft)} days overdue`}
                                  </p>
                                )}
                              </CardContent>
                            </Card>
                          </Link>
                        </motion.div>
                      );
                    })}
                    <Button asChild variant="outline" className="w-full">
                      <Link to="/goals/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Add New Goal
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Mood Timeline */}
        {moodData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="bg-zinc-900/80 backdrop-blur-xl border-zinc-800/50 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-white">Mood Timeline</CardTitle>
                <CardDescription className="text-gray-400">Your mood over the last 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between gap-2 h-32">
                  {moodData.map((item, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full flex items-end justify-center" style={{ height: '80px' }}>
                        <div 
                          className={`w-full rounded-t-lg bg-gradient-to-t ${moodColors[item.mood] || 'from-gray-500 to-gray-600'} opacity-70 hover:opacity-100 transition-opacity`}
                          style={{ 
                            height: `${(Object.keys(moodEmojis).indexOf(item.mood) + 1) * 15}px` 
                          }}
                        />
                      </div>
                      <span className="text-2xl">{moodEmojis[item.mood]}</span>
                      <span className="text-xs text-gray-400">{item.date}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Quick Actions Dock */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50"
        >
          <Dock className="bg-zinc-900/90 backdrop-blur-xl border border-zinc-800/50 shadow-2xl">
            <DockIcon onClick={() => navigate('/journal/new')}>
              <div className="flex flex-col items-center justify-center gap-1">
                <Plus className="w-5 h-5 text-white" />
                <span className="text-xs text-gray-300">New Entry</span>
              </div>
            </DockIcon>
            <DockIcon onClick={() => navigate('/goals/new')}>
              <div className="flex flex-col items-center justify-center gap-1">
                <Target className="w-5 h-5 text-white" />
                <span className="text-xs text-gray-300">New Goal</span>
              </div>
            </DockIcon>
            <DockIcon onClick={() => navigate('/journal/new')}>
              <div className="flex flex-col items-center justify-center gap-1">
                <ImageIcon className="w-5 h-5 text-white" />
                <span className="text-xs text-gray-300">Upload Media</span>
              </div>
            </DockIcon>
          </Dock>
        </motion.div>
      </div>
    </div>
  );
}
