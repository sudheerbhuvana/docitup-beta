"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import type { ReactNode } from "react";

export const FloatingNav = ({
  navItems,
  className,
}: {
  navItems: {
    name: string;
    link: string;
    icon?: ReactNode;
  }[];
  className?: string;
}) => {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: -100,
      }}
      animate={{
        y: 0,
        opacity: 1,
      }}
      transition={{
        duration: 0.3,
        ease: "easeOut"
      }}
      className={cn(
        "flex max-w-fit fixed top-6 inset-x-0 mx-auto backdrop-blur-xl bg-black/40 border border-white/10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] z-[5000] px-6 py-3 items-center justify-center gap-2",
        className
      )}
    >
      {navItems.map((navItem: any, idx: number) => {
        const isHashLink = navItem.link.startsWith('#');
        const handleClick = (e: React.MouseEvent) => {
          if (isHashLink) {
            e.preventDefault();
            const element = document.querySelector(navItem.link);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth' });
            }
          }
        };

        if (isHashLink) {
          return (
            <a
              key={`link=${idx}`}
              href={navItem.link}
              onClick={handleClick}
              className={cn(
                "relative group px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-all duration-200 rounded-lg hover:bg-white/5 cursor-pointer"
              )}
            >
              <span className="relative z-10">{navItem.name}</span>
              <span className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
          );
        }

        return (
          <Link
            key={`link=${idx}`}
            to={navItem.link}
            className={cn(
              "relative group px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-all duration-200 rounded-lg hover:bg-white/5"
            )}
          >
            <span className="relative z-10">{navItem.name}</span>
            <span className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        );
      })}
      <div className="h-6 w-px bg-white/10 mx-2"></div>
      <Link to="/login">
        <button className="relative group px-5 py-2 text-sm font-semibold text-white rounded-lg overflow-hidden transition-all duration-300 hover:scale-105">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-90 group-hover:opacity-100"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-20 blur-xl transition-opacity"></div>
          <span className="relative z-10">Login</span>
        </button>
      </Link>
    </motion.div>
  );
};
