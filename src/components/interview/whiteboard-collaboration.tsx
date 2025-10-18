"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Pen,
  Eraser,
  Square,
  Circle,
  Triangle,
  Type,
  Undo,
  Redo,
  Download,
  Share,
  Palette,
  MousePointer,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Point {
  x: number;
  y: number;
}

interface DrawingElement {
  id: string;
  type: "pen" | "eraser" | "rectangle" | "circle" | "triangle" | "text";
  points: Point[];
  color: string;
  size: number;
  text?: string;
}

interface WhiteboardCollaborationProps {
  isCollaborative?: boolean;
  participants?: Array<{
    id: string;
    name: string;
    color: string;
    cursor?: Point;
  }>;
  onSave?: (elements: DrawingElement[]) => void;
  onShare?: () => void;
  className?: string;
}

export function WhiteboardCollaboration({
  isCollaborative = false,
  participants = [],
  onSave,
  onShare,
  className,
}: WhiteboardCollaborationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentTool, setCurrentTool] = useState<
    "pen" | "eraser" | "rectangle" | "circle" | "triangle" | "text" | "select"
  >("pen");
  const [currentColor, setCurrentColor] = useState("#2563eb");
  const [currentSize, setCurrentSize] = useState([5]);
  const [elements, setElements] = useState<DrawingElement[]>([]);
  const [history, setHistory] = useState<DrawingElement[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const colors = [
    "#2563eb",
    "#dc2626",
    "#16a34a",
    "#ca8a04",
    "#9333ea",
    "#c2410c",
    "#0891b2",
    "#be123c",
    "#000000",
    "#6b7280",
    "#ffffff",
  ];

  const tools = [
    { id: "select", icon: MousePointer, label: "Select" },
    { id: "pen", icon: Pen, label: "Pen" },
    { id: "eraser", icon: Eraser, label: "Eraser" },
    { id: "rectangle", icon: Square, label: "Rectangle" },
    { id: "circle", icon: Circle, label: "Circle" },
    { id: "triangle", icon: Triangle, label: "Triangle" },
    { id: "text", icon: Type, label: "Text" },
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Clear canvas
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw elements
    elements.forEach((element) => {
      drawElement(ctx, element);
    });
  }, [elements]);

  const drawElement = (
    ctx: CanvasRenderingContext2D,
    element: DrawingElement
  ) => {
    ctx.strokeStyle = element.color;
    ctx.lineWidth = element.size;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    switch (element.type) {
      case "pen":
        if (element.points.length > 1) {
          ctx.beginPath();
          ctx.moveTo(element.points[0].x, element.points[0].y);
          element.points.forEach((point) => {
            ctx.lineTo(point.x, point.y);
          });
          ctx.stroke();
        }
        break;

      case "eraser":
        ctx.globalCompositeOperation = "destination-out";
        if (element.points.length > 1) {
          ctx.beginPath();
          ctx.moveTo(element.points[0].x, element.points[0].y);
          element.points.forEach((point) => {
            ctx.lineTo(point.x, point.y);
          });
          ctx.stroke();
        }
        ctx.globalCompositeOperation = "source-over";
        break;

      case "rectangle":
        if (element.points.length >= 2) {
          const start = element.points[0];
          const end = element.points[element.points.length - 1];
          ctx.strokeRect(start.x, start.y, end.x - start.x, end.y - start.y);
        }
        break;

      case "circle":
        if (element.points.length >= 2) {
          const start = element.points[0];
          const end = element.points[element.points.length - 1];
          const radius = Math.sqrt(
            Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)
          );
          ctx.beginPath();
          ctx.arc(start.x, start.y, radius, 0, 2 * Math.PI);
          ctx.stroke();
        }
        break;

      case "text":
        if (element.text && element.points.length > 0) {
          ctx.font = `${element.size * 3}px sans-serif`;
          ctx.fillStyle = element.color;
          ctx.fillText(element.text, element.points[0].x, element.points[0].y);
        }
        break;
    }
  };

  const getMousePos = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent) => {
    if (currentTool === "select") return;

    setIsDrawing(true);
    const point = getMousePos(e);

    const newElement: DrawingElement = {
      id: Date.now().toString(),
      type: currentTool,
      points: [point],
      color: currentColor,
      size: currentSize[0],
    };

    if (currentTool === "text") {
      const text = prompt("Enter text:");
      if (text) {
        newElement.text = text;
        setElements((prev) => [...prev, newElement]);
        saveToHistory([...elements, newElement]);
      }
      setIsDrawing(false);
      return;
    }

    setElements((prev) => [...prev, newElement]);
  };

  const draw = (e: React.MouseEvent) => {
    if (!isDrawing || currentTool === "select") return;

    const point = getMousePos(e);
    setElements((prev) => {
      const newElements = [...prev];
      const lastElement = newElements[newElements.length - 1];

      if (currentTool === "pen" || currentTool === "eraser") {
        lastElement.points.push(point);
      } else {
        // For shapes, update the end point
        lastElement.points = [lastElement.points[0], point];
      }

      return newElements;
    });
  };

  const stopDrawing = () => {
    if (isDrawing) {
      saveToHistory(elements);
      setIsDrawing(false);
    }
  };

  const saveToHistory = (newElements: DrawingElement[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newElements);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex((prev) => prev - 1);
      setElements(history[historyIndex - 1] || []);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex((prev) => prev + 1);
      setElements(history[historyIndex + 1]);
    }
  };

  const clearCanvas = () => {
    setElements([]);
    saveToHistory([]);
  };

  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = "whiteboard.png";
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <Card className={cn("h-full flex flex-col", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Pen className="w-5 h-5" />
            Collaborative Whiteboard
            {isCollaborative && (
              <Badge variant="secondary" className="ml-2">
                {participants.length + 1} participants
              </Badge>
            )}
          </CardTitle>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={undo}
              disabled={historyIndex <= 0}
            >
              <Undo className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
            >
              <Redo className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={downloadCanvas}>
              <Download className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={onShare}>
              <Share className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
          {/* Tools */}
          <div className="flex items-center gap-1">
            {tools.map((tool) => {
              const Icon = tool.icon;
              return (
                <Button
                  key={tool.id}
                  variant={currentTool === tool.id ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setCurrentTool(tool.id as any)}
                  className="w-9 h-9 p-0"
                >
                  <Icon className="w-4 h-4" />
                </Button>
              );
            })}
          </div>

          {/* Color Palette */}
          <div className="flex items-center gap-1">
            <Palette className="w-4 h-4 text-muted-foreground mr-2" />
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => setCurrentColor(color)}
                className={cn(
                  "w-6 h-6 rounded-full border-2 transition-all",
                  currentColor === color
                    ? "border-gray-900 scale-110"
                    : "border-gray-300"
                )}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>

          {/* Size Slider */}
          <div className="flex items-center gap-2 min-w-[120px]">
            <span className="text-sm text-muted-foreground">Size:</span>
            <Slider
              value={currentSize}
              onValueChange={setCurrentSize}
              max={20}
              min={1}
              step={1}
              className="w-16"
            />
            <span className="text-sm w-6">{currentSize[0]}</span>
          </div>

          {/* Clear Button */}
          <Button variant="outline" size="sm" onClick={clearCanvas}>
            Clear
          </Button>
        </div>

        {/* Participants (if collaborative) */}
        {isCollaborative && participants.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Active participants:
            </span>
            <div className="flex gap-1">
              {participants.map((participant) => (
                <Badge
                  key={participant.id}
                  variant="outline"
                  className="text-xs"
                  style={{ borderColor: participant.color }}
                >
                  {participant.name}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="flex-1 p-0">
        <div className="relative h-full bg-white border-t">
          <canvas
            ref={canvasRef}
            className="w-full h-full cursor-crosshair"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
          />

          {/* Participant Cursors */}
          {isCollaborative &&
            participants.map(
              (participant) =>
                participant.cursor && (
                  <motion.div
                    key={participant.id}
                    className="absolute pointer-events-none z-10"
                    style={{
                      left: participant.cursor.x,
                      top: participant.cursor.y,
                      color: participant.color,
                    }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <MousePointer
                      className="w-4 h-4"
                      style={{ color: participant.color }}
                    />
                    <span
                      className="text-xs bg-white px-1 rounded shadow-sm border ml-2"
                      style={{ color: participant.color }}
                    >
                      {participant.name}
                    </span>
                  </motion.div>
                )
            )}
        </div>
      </CardContent>
    </Card>
  );
}
