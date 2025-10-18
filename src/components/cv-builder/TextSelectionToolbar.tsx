"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Bold,
  Italic,
  Languages,
  Maximize2,
  Minimize2,
  Copy,
} from "lucide-react";
import { TextSelectionPosition } from "@/hooks/useTextSelection";

interface TextSelectionToolbarProps {
  selection: TextSelectionPosition | null;
  onAction: (action: string, text: string) => void;
}

export function TextSelectionToolbar({
  selection,
  onAction,
}: TextSelectionToolbarProps) {
  if (!selection) return null;

  const actions = [
    {
      id: "ai-enhance",
      icon: Sparkles,
      label: "AI Enhance",
      color: "text-purple-500",
    },
    { id: "bold", icon: Bold, label: "Bold", color: "text-gray-700" },
    { id: "italic", icon: Italic, label: "Italic", color: "text-gray-700" },
    {
      id: "translate",
      icon: Languages,
      label: "Translate",
      color: "text-blue-500",
    },
    { id: "expand", icon: Maximize2, label: "Expand", color: "text-green-500" },
    {
      id: "shorten",
      icon: Minimize2,
      label: "Shorten",
      color: "text-orange-500",
    },
    { id: "copy", icon: Copy, label: "Copy", color: "text-gray-700" },
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 10 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="absolute z-50"
        style={{
          left: `${selection.x}px`,
          top: `${selection.y - 60}px`,
          transform: "translateX(-50%)",
        }}
      >
        {/* Glassmorphism Card */}
        <div className="backdrop-blur-xl bg-white/90 dark:bg-gray-900/90 border border-gray-200/50 dark:border-gray-700/50 rounded-xl shadow-2xl px-2 py-2 flex items-center gap-1">
          {actions.map((action, index) => (
            <React.Fragment key={action.id}>
              <motion.button
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onAction(action.id, selection.text)}
                className={`p-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${action.color} group relative`}
                title={action.label}
              >
                <action.icon className="w-4 h-4" />

                {/* Tooltip */}
                <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-xs bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-2 py-1 rounded whitespace-nowrap pointer-events-none">
                  {action.label}
                </span>
              </motion.button>

              {/* Divider after certain actions */}
              {(index === 0 || index === 2 || index === 3) && (
                <div className="w-px h-6 bg-gray-200 dark:bg-gray-700" />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Arrow pointing down to selection */}
        <div className="absolute left-1/2 -translate-x-1/2 top-full">
          <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white/90 dark:border-t-gray-900/90" />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
