import { cn } from "@/lib/utils";
import React from "react";

export const Highlight = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <span
      className={cn(
        "relative inline-block z-0 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 rounded-lg px-2 py-1",
        className
      )}
    >
      {children}
    </span>
  );
};

