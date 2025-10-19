"use client";

import React from "react";
import { motion, type MotionProps } from "framer-motion";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

const animationProps: MotionProps = {
  initial: { "--x": "100%", scale: 0.8 },
  animate: { "--x": "-100%", scale: 1 },
  whileTap: { scale: 0.95 },
  transition: {
    repeat: Infinity,
    repeatType: "loop",
    repeatDelay: 1,
    type: "spring",
    stiffness: 20,
    damping: 15,
    mass: 2,
    scale: {
      type: "spring",
      stiffness: 200,
      damping: 5,
      mass: 0.5,
    },
  },
};

interface ShinyButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof MotionProps>,
    MotionProps {
  children: React.ReactNode;
  className?: string;
  asChild?: boolean;
}

export const ShinyButton = React.forwardRef<
  HTMLButtonElement,
  ShinyButtonProps
>(({ children, className, asChild = false, disabled, type, ...props }, ref) => {
  // Extract motion props to avoid passing them to Slot
  const { initial, animate, whileTap, transition, ...restProps } = props as any;
  
  if (asChild) {
    return (
      <Slot
        ref={ref}
        className={cn(
          "relative cursor-pointer rounded-lg border px-6 py-2 font-medium backdrop-blur-xl transition-shadow duration-300 ease-in-out hover:shadow dark:bg-[radial-gradient(circle_at_50%_0%,var(--primary)/10%_0%,transparent_60%)] dark:hover:shadow-[0_0_20px_var(--primary)/10%]",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
        {...restProps}
      >
      <span
        className={cn(
          "relative block size-full text-sm tracking-wide uppercase",
          className?.includes('text-white') ? 'text-white' : 'text-[rgb(0,0,0,65%)] dark:text-[rgb(255,255,255,90%)]',
          className?.includes('font-light') ? 'font-light' : ''
        )}
        style={{
          maskImage:
            "linear-gradient(-75deg,var(--primary) calc(var(--x) + 20%),transparent calc(var(--x) + 30%),var(--primary) calc(var(--x) + 100%))",
          "--x": "100%",
        } as React.CSSProperties}
      >
        {children}
      </span>
        <span
          style={{
            mask: "linear-gradient(rgb(0,0,0), rgb(0,0,0)) content-box exclude,linear-gradient(rgb(0,0,0), rgb(0,0,0))",
            WebkitMask:
              "linear-gradient(rgb(0,0,0), rgb(0,0,0)) content-box exclude,linear-gradient(rgb(0,0,0), rgb(0,0,0))",
            backgroundImage:
              "linear-gradient(-75deg,var(--primary)/10% calc(var(--x)+20%),var(--primary)/50% calc(var(--x)+25%),var(--primary)/10% calc(var(--x)+100%))",
            "--x": "100%",
          } as React.CSSProperties}
          className="absolute inset-0 z-10 block rounded-[inherit] p-px"
        />
      </Slot>
    );
  }

  return (
    <motion.button
      ref={ref}
      type={type}
      className={cn(
        "relative cursor-pointer rounded-xl overflow-hidden px-6 py-2 font-medium backdrop-blur-xl transition-all duration-300 ease-in-out hover:scale-105 active:scale-95",
        disabled && "opacity-50 cursor-not-allowed pointer-events-none",
        className
      )}
      disabled={disabled}
      {...animationProps}
      {...props}
    >
      <span
        className={cn(
          "relative block size-full text-sm tracking-wide uppercase",
          className?.includes('text-white') ? 'text-white' : 'text-[rgb(0,0,0,65%)] dark:text-[rgb(255,255,255,90%)]',
          className?.includes('font-light') ? 'font-light' : ''
        )}
        style={{
          maskImage:
            "linear-gradient(-75deg,var(--primary) calc(var(--x) + 20%),transparent calc(var(--x) + 30%),var(--primary) calc(var(--x) + 100%))",
        } as React.CSSProperties}
      >
        {children}
      </span>
      <span
        style={{
          mask: "linear-gradient(rgb(0,0,0), rgb(0,0,0)) content-box exclude,linear-gradient(rgb(0,0,0), rgb(0,0,0))",
          WebkitMask:
            "linear-gradient(rgb(0,0,0), rgb(0,0,0)) content-box exclude,linear-gradient(rgb(0,0,0), rgb(0,0,0))",
          backgroundImage:
            "linear-gradient(-75deg,var(--primary)/10% calc(var(--x)+20%),var(--primary)/50% calc(var(--x)+25%),var(--primary)/10% calc(var(--x)+100%))",
        } as React.CSSProperties}
        className="absolute inset-0 z-10 block rounded-[inherit] p-px"
      />
    </motion.button>
  );
});

ShinyButton.displayName = "ShinyButton";

