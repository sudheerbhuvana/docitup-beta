import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { goalsAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Plus, Target, CheckCircle2, Globe, Lock, Calendar, Award } from 'lucide-react';
import { differenceInDays } from 'date-fns';
import { toast } from 'sonner';

interface Goal {
  _id: string;
  title: string;
  description?: string;
  progressPercentage: number;
  status: string;
  targetDate?: string;
  category?: string;
  isPublic?: boolean;
}

const categoryColors: Record<string, string> = {
  'Health': 'from-green-500 to-emerald-500',
  'Learning': 'from-blue-500 to-cyan-500',
  'Career': 'from-purple-500 to-pink-500',
  'Finance': 'from-yellow-500 to-orange-500',
  'Relationships': 'from-pink-500 to-rose-500',
  'Personal': 'from-indigo-500 to-purple-500',
  'Fitness': 'from-red-500 to-orange-500',
  'Creative': 'from-violet-500 to-purple-500',
};

export default function GoalsPage() {
  const [allGoals, setAllGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'completed'>('active');

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    const token = localStorage.getItem('token');
    
    // Demo mode - use mock data
    if (token === 'demo-token') {
      const mockGoals: Goal[] = [
        { 
          _id: '1', 
          title: 'Learn a New Skill', 
          description: 'Master a new programming language', 
          progressPercentage: 45, 
          status: 'active', 
          category: 'Learning',
          targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          isPublic: false 
        },
        { 
          _id: '2', 
          title: 'Build Healthy Habits', 
          description: 'Exercise regularly and eat well', 
          progressPercentage: 70, 
          status: 'active', 
          category: 'Health',
          targetDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
          isPublic: true 
        },
        { 
          _id: '3', 
          title: 'Read 12 Books This Year', 
          description: 'Expand knowledge through reading', 
          progressPercentage: 25, 
          status: 'active', 
          category: 'Learning',
          targetDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
          isPublic: false 
        },
        { 
          _id: '4', 
          title: 'Complete Marathon Training', 
          description: 'Finish a full marathon', 
          progressPercentage: 100, 
          status: 'completed', 
          category: 'Fitness',
          isPublic: true 
        },
      ];
      setAllGoals(mockGoals);
      setLoading(false);
      return;
    }
    
    try {
      const response = await goalsAPI.getAll({ limit: 100 });
      setAllGoals(response.data.goals || []);
    } catch (error) {
      console.error('Error fetching goals:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter goals by tab
  const filteredGoals = useMemo(() => {
    if (activeTab === 'all') return allGoals;
    if (activeTab === 'active') return allGoals.filter(g => g.status === 'active');
    return allGoals.filter(g => g.status === 'completed');
  }, [allGoals, activeTab]);

  const togglePublic = async (goalId: string, currentPublic: boolean) => {
    try {
      await goalsAPI.update(goalId, { isPublic: !currentPublic });
      setAllGoals(goals => 
        goals.map(g => g._id === goalId ? { ...g, isPublic: !currentPublic } : g)
      );
      toast.success(`Goal ${!currentPublic ? 'made public' : 'made private'}`);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update goal');
    }
  };

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
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-2 w-full" />
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
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">Goals</h1>
            <p className="text-gray-400">Track and achieve your personal goals</p>
          </div>
          <Button asChild size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
            <Link to="/goals/new">
              <Plus className="mr-2 h-4 w-4" />
              New Goal
            </Link>
          </Button>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="w-full">
            <TabsList className="bg-zinc-900/80 backdrop-blur-xl border-zinc-800/50">
              <TabsTrigger value="active" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600">
                <Target className="mr-2 h-4 w-4" />
                Active
                <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                  {allGoals.filter(g => g.status === 'active').length}
                </span>
              </TabsTrigger>
              <TabsTrigger value="completed" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-emerald-600">
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Completed
                <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                  {allGoals.filter(g => g.status === 'completed').length}
                </span>
              </TabsTrigger>
              <TabsTrigger value="all" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-gray-600 data-[state=active]:to-zinc-600">
                <Award className="mr-2 h-4 w-4" />
                All Goals
                <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                  {allGoals.length}
                </span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              {filteredGoals.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Card className="bg-zinc-900/80 backdrop-blur-xl border-zinc-800/50 shadow-2xl">
                    <CardContent className="flex flex-col items-center justify-center py-16">
                      <Target className="h-16 w-16 text-gray-600 mb-4" />
                      <h3 className="text-xl font-semibold text-white mb-2">
                        {activeTab === 'active' ? 'No active goals' : activeTab === 'completed' ? 'No completed goals' : 'No goals yet'}
                      </h3>
                      <p className="text-gray-400 text-sm mb-6 text-center max-w-md">
                        {activeTab === 'active' 
                          ? 'Start setting goals to track your progress'
                          : activeTab === 'completed'
                          ? 'Complete some goals to see them here'
                          : 'Start setting and tracking your goals'}
                      </p>
                      <Button asChild size="lg">
                        <Link to="/goals/new">
                          <Plus className="mr-2 h-4 w-4" />
                          Create Your First Goal
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredGoals.map((goal, index) => {
                    const daysLeft = goal.targetDate 
                      ? differenceInDays(new Date(goal.targetDate), new Date())
                      : null;
                    const categoryColor = goal.category 
                      ? categoryColors[goal.category] || 'from-gray-500 to-gray-600'
                      : 'from-gray-500 to-gray-600';
                    const isOverdue = daysLeft !== null && daysLeft < 0;
                    const isDueSoon = daysLeft !== null && daysLeft >= 0 && daysLeft <= 7;

                    return (
                      <motion.div
                        key={goal._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.05 * index }}
                      >
                        <Link to={`/goals/${goal._id}`}>
                          <Card className="bg-zinc-900/80 backdrop-blur-xl border-zinc-800/50 shadow-2xl hover:border-purple-500/50 transition-all duration-300 hover:scale-[1.02] cursor-pointer h-full group">
                            <CardHeader>
                              <div className="flex items-start justify-between gap-2 mb-3">
                                <div className="flex-1">
                                  <CardTitle className="text-xl font-bold text-white line-clamp-2 group-hover:text-purple-400 transition-colors mb-2">
                                    {goal.title}
                                  </CardTitle>
                                  {goal.category && (
                                    <span className={`inline-block px-3 py-1 bg-gradient-to-r ${categoryColor} text-white rounded-full text-xs font-semibold mb-2`}>
                                      {goal.category}
                                    </span>
                                  )}
                                </div>
                                {goal.status === 'completed' && (
                                  <CheckCircle2 className="h-6 w-6 text-green-400 flex-shrink-0" />
                                )}
                              </div>
                              {goal.description && (
                                <p className="text-sm text-gray-400 line-clamp-2 leading-relaxed">
                                  {goal.description}
                                </p>
                              )}
                            </CardHeader>
                            <CardContent className="space-y-4">
                              {/* Progress */}
                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-gray-400">Progress</span>
                                  <span className="font-bold text-white">{goal.progressPercentage}%</span>
                                </div>
                                <div className="w-full bg-zinc-700/50 rounded-full h-3 overflow-hidden">
                                  <div
                                    className={`bg-gradient-to-r ${categoryColor} h-3 rounded-full transition-all duration-500 ease-out`}
                                    style={{ width: `${goal.progressPercentage}%` }}
                                  />
                                </div>
                              </div>

                              {/* Target Date */}
                              {goal.targetDate && (
                                <div className="flex items-center gap-2 text-sm">
                                  <Calendar className={`h-4 w-4 ${
                                    isOverdue ? 'text-red-400' : 
                                    isDueSoon ? 'text-yellow-400' : 
                                    'text-gray-400'
                                  }`} />
                                  <span className={`${
                                    isOverdue ? 'text-red-400' : 
                                    isDueSoon ? 'text-yellow-400' : 
                                    'text-gray-400'
                                  }`}>
                                    {isOverdue 
                                      ? `${Math.abs(daysLeft)} days overdue`
                                      : daysLeft === 0 
                                        ? 'Due today'
                                        : daysLeft === 1
                                          ? 'Due tomorrow'
                                          : `${daysLeft} days left`}
                                  </span>
                                </div>
                              )}

                              {/* Public/Private Toggle */}
                              <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
                                <div className="flex items-center gap-2">
                                  {goal.isPublic ? (
                                    <Globe className="h-4 w-4 text-blue-400" />
                                  ) : (
                                    <Lock className="h-4 w-4 text-gray-400" />
                                  )}
                                  <span className="text-xs text-gray-400">
                                    {goal.isPublic ? 'Public' : 'Private'}
                                  </span>
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    togglePublic(goal._id, goal.isPublic || false);
                                  }}
                                  className="flex items-center gap-2"
                                >
                                  <Switch
                                    checked={goal.isPublic || false}
                                    onCheckedChange={() => togglePublic(goal._id, goal.isPublic || false)}
                                    className="pointer-events-none"
                                  />
                                </button>
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
