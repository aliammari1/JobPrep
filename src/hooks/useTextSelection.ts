"use client";

import { useState, useEffect, RefObject } from "react";

export interface TextSelectionPosition {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export function useTextSelection(containerRef: RefObject<HTMLElement | null>) {
  const [selection, setSelection] = useState<TextSelectionPosition | null>(null);

  useEffect(() => {
    const handleSelection = () => {
      const sel = window.getSelection();
      
      if (!sel || sel.rangeCount === 0 || !containerRef.current) {
        setSelection(null);
        return;
      }

      const selectedText = sel.toString().trim();
      
      if (!selectedText || selectedText.length === 0) {
        setSelection(null);
        return;
      }

      // Check if selection is within our container
      const range = sel.getRangeAt(0);
      const commonAncestor = range.commonAncestorContainer;
      const isWithinContainer = 
        containerRef.current.contains(commonAncestor as Node);

      if (!isWithinContainer) {
        setSelection(null);
        return;
      }

      // Get the bounding rect of the selection
      const rect = range.getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();

      setSelection({
        text: selectedText,
        x: rect.left + rect.width / 2 - containerRect.left,
        y: rect.top - containerRect.top,
        width: rect.width,
        height: rect.height,
      });
    };

    const handleMouseUp = () => {
      setTimeout(handleSelection, 10);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        window.getSelection()?.removeAllRanges();
        setSelection(null);
      }
    };

    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("keyup", handleKeyUp);
    document.addEventListener("selectionchange", handleSelection);

    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("keyup", handleKeyUp);
      document.removeEventListener("selectionchange", handleSelection);
    };
  }, [containerRef]);

  return selection;
}
