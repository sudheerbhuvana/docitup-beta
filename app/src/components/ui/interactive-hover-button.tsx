import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface InteractiveHoverButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string;
}

export function InteractiveHoverButton({
  children,
  text,
  className,
  ...props
}: InteractiveHoverButtonProps) {
  const content = text || children;
  
  return (
    <button
      className={cn(
        "group relative w-auto cursor-pointer overflow-hidden rounded-xl p-2 px-6 text-center font-semibold transition-all duration-300 hover:scale-105 active:scale-95",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-white/80 transition-all duration-300 group-hover:scale-[100.8] group-hover:bg-white"></div>
        <span className="inline-block transition-all duration-300 group-hover:translate-x-12 group-hover:opacity-0">
          {content}
        </span>
      </div>
      <div className="absolute top-0 z-10 flex h-full w-full translate-x-12 items-center justify-center gap-2 opacity-0 transition-all duration-300 group-hover:-translate-x-5 group-hover:opacity-100">
        <span>{content}</span>
        <ArrowRight className="h-4 w-4" />
      </div>
    </button>
  );
}

