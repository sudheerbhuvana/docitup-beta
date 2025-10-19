import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Sparkles, ChevronRight } from 'lucide-react';
import { AnimatedGradientText } from './animated-gradient-text';

interface BannerProps {
  text?: string;
  href?: string;
  className?: string;
}

export function Banner({ 
  text = "Introducing Docitup", 
  href = "#",
  className 
}: BannerProps) {
  return (
    <Link
      to={href}
      className={cn(
        "group inline-flex items-center gap-3 px-5 py-2.5 rounded-full",
        "bg-white/5 backdrop-blur-md border border-white/10",
        "hover:bg-white/10 hover:border-white/20",
        "transition-all duration-300",
        "shadow-[0_0_15px_rgba(168,85,247,0.15)]",
        "hover:shadow-[0_0_25px_rgba(168,85,247,0.3)]",
        className
      )}
    >
      <Sparkles className="h-4 w-4 text-purple-400 group-hover:text-purple-300 transition-colors" />
      <AnimatedGradientText
        speed={1.5}
        colorFrom="#a855f7"
        colorTo="#ec4899"
        className="text-sm font-medium"
      >
        {text}
      </AnimatedGradientText>
      <ChevronRight className="h-4 w-4 text-purple-400 group-hover:text-purple-300 group-hover:translate-x-0.5 transition-all" />
    </Link>
  );
}
