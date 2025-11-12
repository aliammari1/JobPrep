"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { java } from "@codemirror/lang-java";
import { cpp } from "@codemirror/lang-cpp";
import { oneDark } from "@codemirror/theme-one-dark";
import { EditorView } from "@codemirror/view";
import { useTheme } from "next-themes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileCode,
  Save,
  RotateCcw,
  Copy,
  Maximize2,
  Minimize2,
  Terminal,
  Zap,
  Clock,
  MemoryStick,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface CodeEditorEnhancedProps {
  code: string;
  onCodeChange: (code: string) => void;
  selectedLanguage: string;
  onLanguageChange: (language: string) => void;
  onRun?: () => void;
  onReset?: () => void;
  isRunning?: boolean;
  lastSaved?: Date | null;
  hasUnsavedChanges?: boolean;
  showConsole?: boolean;
  onToggleConsole?: (show: boolean) => void;
  consoleOutput?: string[];
  executionMetrics?: {
    totalTime: number;
    memoryUsed: number;
    passedTests: number;
    totalTests: number;
  };
  timeElapsed?: number;
  successRate?: number;
}

const languages = [
  { value: "javascript", label: "JavaScript", extension: "js" },
  { value: "python", label: "Python", extension: "py" },
  { value: "java", label: "Java", extension: "java" },
  { value: "cpp", label: "C++", extension: "cpp" },
  { value: "typescript", label: "TypeScript", extension: "ts" },
];

export function CodeEditorEnhanced({
  code,
  onCodeChange,
  selectedLanguage,
  onLanguageChange,
  onRun,
  onReset,
  isRunning = false,
  lastSaved,
  hasUnsavedChanges = false,
  showConsole = false,
  onToggleConsole,
  consoleOutput = [],
  executionMetrics,
  timeElapsed = 0,
  successRate = 0,
}: CodeEditorEnhancedProps) {
  const { theme } = useTheme();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    toast.success("Code copied to clipboard");
  };

  const getLanguageExtension = () => {
    switch (selectedLanguage) {
      case "python":
        return python();
      case "java":
        return java();
      case "cpp":
        return cpp();
      case "typescript":
        return javascript({ jsx: true, typescript: true });
      default:
        return javascript({ jsx: true, typescript: false });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "h-full",
        isFullscreen && "fixed inset-0 z-50 bg-background"
      )}
      ref={editorRef}
    >
      <Card className={cn("h-full flex flex-col", isFullscreen && "rounded-none")}>
        {/* Header with controls */}
        <CardHeader className="pb-3 border-b">
          <div className="space-y-3">
            {/* Top row: Title and stats */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <FileCode className="w-5 h-5 text-blue-500" />
                <CardTitle className="text-lg">Code Editor</CardTitle>
              </div>
              <div className="flex items-center gap-3 text-sm">
                {executionMetrics && successRate > 0 && (
                  <Badge
                    variant="outline"
                    className={cn(
                      "font-mono text-xs",
                      successRate === 100
                        ? "text-green-600 border-green-300 bg-green-50 dark:bg-green-950/20"
                        : successRate > 0
                        ? "text-yellow-600 border-yellow-300 bg-yellow-50 dark:bg-yellow-950/20"
                        : "text-red-600 border-red-300 bg-red-50 dark:bg-red-950/20"
                    )}
                  >
                    {Math.round(successRate)}%
                  </Badge>
                )}
                {lastSaved && (
                  <div className="text-xs text-muted-foreground hidden sm:flex items-center gap-1">
                    <Save className="w-3 h-3" />
                    <span>Saved</span>
                  </div>
                )}
                {hasUnsavedChanges && (
                  <Badge variant="secondary" className="text-xs h-fit">
                    <span className="w-2 h-2 bg-orange-500 rounded-full mr-1"></span>
                    Changes
                  </Badge>
                )}
              </div>
            </div>

            {/* Controls row - Simplified */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
              {/* Language selector */}
              <div className="flex items-center gap-2">
                <Select value={selectedLanguage} onValueChange={onLanguageChange}>
                  <SelectTrigger className="w-[160px] h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.value} value={lang.value}>
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Main action buttons */}
              <div className="flex items-center gap-2">
                <Button
                  onClick={onRun}
                  disabled={isRunning}
                  size="sm"
                  className="gap-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white h-9"
                >
                  {isRunning ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Zap className="w-4 h-4" />
                      </motion.div>
                      <span className="hidden sm:inline">Running...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      <span className="hidden sm:inline">Run Code</span>
                    </>
                  )}
                </Button>

                {/* Secondary actions - Compact */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyCode}
                  className="h-9 px-2"
                  title="Copy code (Ctrl+C)"
                >
                  <Copy className="w-4 h-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onReset}
                  className="h-9 px-2"
                  title="Reset code"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsFullscreen(!isFullscreen);
                  }}
                  className="h-9 px-2"
                  title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                >
                  {isFullscreen ? (
                    <Minimize2 className="w-4 h-4" />
                  ) : (
                    <Maximize2 className="w-4 h-4" />
                  )}
                </Button>

                <Button
                  variant={showConsole ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onToggleConsole?.(!showConsole)}
                  className="h-9 px-2"
                  title="Toggle console output"
                >
                  <Terminal className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>

        {/* Code Editor */}
        <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden p-4">
          <div className="flex-1 border rounded-lg overflow-hidden bg-muted/30">
            <CodeMirror
              value={code}
              height={showConsole ? "60%" : "100%"}
              theme={theme === "dark" ? oneDark : undefined}
              extensions={[getLanguageExtension(), EditorView.lineWrapping]}
              onChange={(value) => onCodeChange(value || "")}
              basicSetup={{
                lineNumbers: true,
                highlightActiveLineGutter: true,
                highlightSpecialChars: true,
                foldGutter: true,
                drawSelection: true,
                dropCursor: true,
                allowMultipleSelections: true,
                indentOnInput: true,
                syntaxHighlighting: true,
                bracketMatching: true,
                closeBrackets: true,
                autocompletion: true,
                rectangularSelection: true,
                crosshairCursor: true,
                highlightActiveLine: true,
                highlightSelectionMatches: true,
              }}
              className="text-sm"
            />
          </div>

          {/* Console Output */}
          {showConsole && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="border rounded-lg bg-black/95 text-green-400 font-mono text-sm p-4 max-h-64 overflow-y-auto flex-1"
            >
              {consoleOutput.length === 0 ? (
                <div className="text-gray-500">
                  Run your code to see output here...
                </div>
              ) : (
                consoleOutput.map((line, i) => (
                  <div key={i} className="whitespace-pre-wrap text-xs">
                    {line}
                  </div>
                ))
              )}
            </motion.div>
          )}
        </CardContent>

        {/* Bottom status bar */}
        {executionMetrics && executionMetrics.totalTime > 0 && (
          <div className="border-t bg-muted/30 px-4 py-3 flex items-center justify-between text-sm">
            <div className="flex items-center gap-6 text-muted-foreground">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{executionMetrics.totalTime.toFixed(2)}ms</span>
              </div>
              <div className="flex items-center gap-2">
                <MemoryStick className="w-4 h-4" />
                <span>{executionMetrics.memoryUsed.toFixed(2)}KB</span>
              </div>
            </div>
            <Badge variant="outline">
              {executionMetrics.passedTests}/{executionMetrics.totalTests} Tests Passed
            </Badge>
          </div>
        )}
      </Card>
    </motion.div>
  );
}
