import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { goalsAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Field, FieldLabel } from '@/components/ui/field';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Save, Trash2, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface GoalStep {
  _id: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  completedAt?: string;
}

interface Goal {
  _id: string;
  title: string;
  description?: string;
  category?: string;
  targetDate?: string;
  progressPercentage: number;
  status: string;
  isPublic: boolean;
  steps?: GoalStep[];
}

export default function GoalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === 'new';
  const [goal, setGoal] = useState<Goal>({
    _id: '',
    title: '',
    description: '',
    progressPercentage: 0,
    status: 'active',
    isPublic: false,
    steps: [],
  });
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isNew && id) {
      fetchGoal();
    } else {
      setLoading(false);
    }
  }, [id, isNew]);

  const fetchGoal = async () => {
    try {
      const response = await goalsAPI.getById(id!);
      setGoal(response.data.goal);
    } catch (error) {
      console.error('Error fetching goal:', error);
      toast.error('Failed to load goal');
      navigate('/goals');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (isNew) {
        const response = await goalsAPI.create({
          title: goal.title,
          description: goal.description,
          category: goal.category,
          targetDate: goal.targetDate,
          isPublic: goal.isPublic,
          steps: goal.steps,
        });
        toast.success('Goal created successfully');
        navigate(`/goals/${response.data.goal._id}`);
      } else {
        await goalsAPI.update(id!, {
          title: goal.title,
          description: goal.description,
          category: goal.category,
          targetDate: goal.targetDate,
          isPublic: goal.isPublic,
          progressPercentage: goal.progressPercentage,
          status: goal.status,
          steps: goal.steps,
        });
        toast.success('Goal updated successfully');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || error.response?.data?.message || 'Failed to save goal');
    } finally{
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this goal?')) return;

    try {
      await goalsAPI.delete(id!);
      toast.success('Goal deleted successfully');
      navigate('/goals');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete goal');
    }
  };

  const toggleStep = async (stepId: string, completed: boolean) => {
    try {
      await goalsAPI.updateStep(id!, stepId, {
        isCompleted: completed,
      });
      if (!isNew) {
        fetchGoal();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update step');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black p-8">
        <div className="text-white">Loading...</div>
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild className="text-white hover:bg-zinc-800">
              <Link to="/goals">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-4xl font-bold text-white">
                {isNew ? 'New Goal' : 'Edit Goal'}
              </h1>
            </div>
          </div>
          <div className="flex gap-2">
            {!isNew && (
              <Button variant="destructive" onClick={handleDelete}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            )}
            <Button onClick={handleSave} disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-zinc-900/80 backdrop-blur-xl border-zinc-800/50 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-xl text-white">Goal Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Field>
                <FieldLabel htmlFor="title" className="text-white">Title</FieldLabel>
                <Input
                  id="title"
                  placeholder="Goal title..."
                  value={goal.title}
                  onChange={(e) => setGoal({ ...goal, title: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 text-white placeholder:text-gray-500"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="description" className="text-white">Description</FieldLabel>
                <Textarea
                  id="description"
                  placeholder="Describe your goal..."
                  value={goal.description || ''}
                  onChange={(e) => setGoal({ ...goal, description: e.target.value })}
                  className="min-h-[150px] bg-zinc-800 border-zinc-700 text-white placeholder:text-gray-500"
                />
              </Field>
              <div className="grid gap-4 md:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="category" className="text-white">Category</FieldLabel>
                  <Input
                    id="category"
                    placeholder="e.g., Health, Career..."
                    value={goal.category || ''}
                    onChange={(e) => setGoal({ ...goal, category: e.target.value })}
                    className="bg-zinc-800 border-zinc-700 text-white placeholder:text-gray-500"
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="targetDate" className="text-white">Target Date</FieldLabel>
                  <Input
                    id="targetDate"
                    type="date"
                    value={goal.targetDate ? format(new Date(goal.targetDate), 'yyyy-MM-dd') : ''}
                    onChange={(e) =>
                      setGoal({ ...goal, targetDate: e.target.value ? new Date(e.target.value).toISOString() : undefined })
                    }
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </Field>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="public"
                  checked={goal.isPublic}
                  onCheckedChange={(checked) => setGoal({ ...goal, isPublic: !!checked })}
                />
                <label htmlFor="public" className="text-sm font-medium leading-none text-gray-300 peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Make this goal public
                </label>
              </div>
            </CardContent>
          </Card>

          {!isNew && goal.steps && goal.steps.length > 0 && (
            <Card className="bg-zinc-900/80 backdrop-blur-xl border-zinc-800/50 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-xl text-white">Action Steps</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {goal.steps.map((step) => (
                  <div key={step._id} className="flex items-start space-x-3 p-3 border border-zinc-700 rounded-lg bg-zinc-800/50">
                    <Checkbox
                      checked={step.isCompleted}
                      onCheckedChange={(checked) => toggleStep(step._id, !!checked)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className={`font-medium text-white ${step.isCompleted ? 'line-through text-gray-500' : ''}`}>
                        {step.title}
                      </div>
                      {step.description && (
                        <div className={`text-sm text-gray-400 ${step.isCompleted ? 'line-through' : ''}`}>
                          {step.description}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card className="bg-zinc-900/80 backdrop-blur-xl border-zinc-800/50 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-xl text-white">Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Completion</span>
                  <span className="font-medium text-white">{goal.progressPercentage}%</span>
                </div>
                <Progress value={goal.progressPercentage} />
              </div>
              {goal.targetDate && (
                <div className="text-sm">
                  <div className="text-gray-400">Target Date</div>
                  <div className="font-medium text-white">{format(new Date(goal.targetDate), 'MMM d, yyyy')}</div>
                </div>
              )}
              {goal.status === 'completed' && (
                <div className="flex items-center gap-2 text-green-400">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-sm font-medium">Completed</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
    </div>
  );
}

