import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const moods = [
  { value: 'great', emoji: '😄', label: 'Great', color: 'from-green-500 to-emerald-500' },
  { value: 'good', emoji: '😊', label: 'Good', color: 'from-blue-500 to-cyan-500' },
  { value: 'okay', emoji: '😐', label: 'Okay', color: 'from-yellow-500 to-orange-500' },
  { value: 'bad', emoji: '😔', label: 'Bad', color: 'from-orange-500 to-red-500' },
  { value: 'terrible', emoji: '😢', label: 'Terrible', color: 'from-red-500 to-rose-500' },
] as const;

export type MoodValue = typeof moods[number]['value'];

interface MoodSelectorProps {
  value?: MoodValue | '';
  onChange?: (mood: MoodValue | '') => void;
  className?: string;
}

export function MoodSelector({ value = '', onChange, className }: MoodSelectorProps) {
  const selectedMood = moods.find(m => m.value === value);

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex flex-wrap gap-2">
        {moods.map((mood) => (
          <motion.button
            key={mood.value}
            type="button"
            onClick={() => onChange?.(value === mood.value ? '' : mood.value)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all duration-300',
              value === mood.value
                ? 'border-purple-500 bg-purple-500/20 shadow-lg shadow-purple-500/20 scale-105'
                : 'border-zinc-700 bg-zinc-800/50 hover:border-purple-500/50 hover:bg-purple-500/10'
            )}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="text-2xl">{mood.emoji}</span>
            <span className={cn(
              'text-sm font-medium',
              value === mood.value ? 'text-white' : 'text-gray-400'
            )}>
              {mood.label}
            </span>
          </motion.button>
        ))}
      </div>
      {selectedMood && (
        <p className="text-xs text-gray-400">
          Selected: {selectedMood.emoji} {selectedMood.label}
        </p>
      )}
    </div>
  );
}

