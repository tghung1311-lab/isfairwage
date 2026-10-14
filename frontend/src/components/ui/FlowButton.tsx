"use client";

import React from "react";
import { motion, Transition } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { cn } from "../../lib/utils";

interface FlowButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string;
}

const FlowButton = React.forwardRef<HTMLButtonElement, FlowButtonProps>(
  ({ text = "Button", className, ...props }, ref) => {
    const glowColors = ["#2563eb", "#3b82f6", "#60a5fa", "#93c5fd"];
    const scale = 1.6;
    const duration = 6;

    const breatheEffect = {
      background: glowColors.map(
        (color) =>
          `radial-gradient(circle at 50% 50%, ${color} 0%, transparent 100%)`
      ),
      scale: [1 * scale, 1.05 * scale, 1 * scale],
      transition: {
        repeat: Infinity,
        duration: duration,
        repeatType: "mirror",
        ease: "easeInOut",
      } as Transition,
    };

    return (
      <button
        ref={ref}
        className={cn(
          "group relative inline-flex items-center justify-center overflow-hidden rounded-full px-6 py-2 font-semibold transition-all duration-300",
          "border border-blue-500/30 dark:border-blue-400/20 bg-blue-600 dark:bg-blue-700 backdrop-blur-md text-white",
          "hover:bg-blue-700 dark:hover:bg-blue-600 hover:shadow-xl",
          className
        )}
        {...props}
      >
        {/* Embedded Glow Effect */}
        <motion.div
          animate={breatheEffect}
          className={cn(
            "pointer-events-none absolute inset-0 z-0 transform-gpu blur-lg scale-[1.6]"
          )}
          style={{
            willChange: "transform",
            backfaceVisibility: "hidden",
          }}
        />

        {/* Foreground Text */}
        <span className="relative z-10 flex items-center gap-2 transition-all duration-300 group-hover:translate-x-1">
          {text}
          <ArrowRight className="h-4 w-4" />
        </span>
      </button>
    );
  }
);

FlowButton.displayName = "FlowButton";

export default FlowButton;
