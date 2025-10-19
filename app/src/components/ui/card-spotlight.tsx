import React, { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform, useMotionTemplate } from "framer-motion";
import { cn } from "@/lib/utils";

export const CardSpotlight = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const divRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const position = useMotionValue({ x: 0, y: 0 });
  const opacity = useSpring(useMotionValue(0), {
    stiffness: 200,
    damping: 90,
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current || isFocused) return;

    const div = divRef.current;
    const rect = div.getBoundingClientRect();

    position.set({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleFocus = () => {
    setIsFocused(true);
    if (divRef.current) {
      const div = divRef.current;
      const rect = div.getBoundingClientRect();
      position.set({
        x: rect.width / 2,
        y: rect.height / 2,
      });
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    position.set({ x: 0, y: 0 });
  };

  const handleMouseEnter = () => {
    opacity.set(1);
  };

  const handleMouseLeave = () => {
    opacity.set(0);
  };

  const x = useTransform(position, (pos) => pos.x);
  const y = useTransform(position, (pos) => pos.y);

  return (
    <motion.div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn("relative overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900", className)}
    >
      <div className="relative h-full overflow-hidden">
        <motion.div
          className="pointer-events-none absolute -inset-px opacity-0 transition duration-300"
          style={{
            opacity,
            background: useMotionTemplate`radial-gradient(600px circle at ${x}px ${y}px, rgba(59, 130, 246, 0.15), transparent 40%)`,
          }}
        />
        {children}
      </div>
    </motion.div>
  );
};

