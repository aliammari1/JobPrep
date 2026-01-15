import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  actualOutput?: string;
  passed?: boolean;
  executionTime?: number;
}

interface Challenge {
  id: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  description: string;
  constraints: string[];
  examples: Array<{ input: string; output: string; explanation: string }>;
  testCases: TestCase[];
  timeLimit: number;
  memoryLimit: number;
  hints?: string[];
  starterCode?: Record<string, string>;
}

interface ExecutionMetrics {
  totalTime: number;
  memoryUsed: number;
  passedTests: number;
  totalTests: number;
}

interface CodeChallengeState {
  // Challenge data
  currentChallenge: Challenge | null;
  generatedChallenges: Challenge[];
  currentChallengeIndex: number;

  // Code state
  code: Record<string, string>; // language -> code
  selectedLanguage: string;
  testResults: TestCase[];
  executionMetrics: ExecutionMetrics;

  // UI state
  hasUnsavedChanges: boolean;
  lastSaved: Date | null;
  isRunning: boolean;
  isTimerRunning: boolean;
  timeElapsed: number;
  showConsole: boolean;
  consoleOutput: string[];
  isFullscreen: boolean;

  // User context
  cvText: string;
  jobDescriptionText: string;
  selectedDifficulty: "Easy" | "Medium" | "Hard";

  // Actions
  setCurrentChallenge: (challenge: Challenge) => void;
  setGeneratedChallenges: (challenges: Challenge[]) => void;
  setCurrentChallengeIndex: (index: number) => void;

  setCode: (language: string, code: string) => void;
  getCode: (language: string) => string;
  setSelectedLanguage: (language: string) => void;

  setTestResults: (results: TestCase[]) => void;
  setExecutionMetrics: (metrics: ExecutionMetrics) => void;

  setHasUnsavedChanges: (value: boolean) => void;
  setLastSaved: (date: Date | null) => void;
  setIsRunning: (value: boolean) => void;
  setIsTimerRunning: (value: boolean) => void;
  setTimeElapsed: (seconds: number) => void;
  incrementTimeElapsed: () => void;
  setShowConsole: (value: boolean) => void;
  addConsoleOutput: (output: string) => void;
  clearConsoleOutput: () => void;
  setIsFullscreen: (value: boolean) => void;

  setCvText: (text: string) => void;
  setJobDescriptionText: (text: string) => void;
  setSelectedDifficulty: (difficulty: "Easy" | "Medium" | "Hard") => void;

  resetCode: (language: string, defaultCode: string) => void;
  reset: () => void;
}

const initialState = {
  currentChallenge: null,
  generatedChallenges: [],
  currentChallengeIndex: 0,
  code: {},
  selectedLanguage: "javascript",
  testResults: [],
  executionMetrics: {
    totalTime: 0,
    memoryUsed: 0,
    passedTests: 0,
    totalTests: 5,
  },
  hasUnsavedChanges: false,
  lastSaved: null,
  isRunning: false,
  isTimerRunning: false,
  timeElapsed: 0,
  showConsole: false,
  consoleOutput: [] as string[],
  isFullscreen: false,
  cvText: "",
  jobDescriptionText: "",
  selectedDifficulty: "Medium" as const,
};

export const useCodeChallengeStore = create<CodeChallengeState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      setCurrentChallenge: (challenge) => set({ currentChallenge: challenge }),
      setGeneratedChallenges: (challenges) =>
        set({ generatedChallenges: challenges }),
      setCurrentChallengeIndex: (index) =>
        set({ currentChallengeIndex: index }),

      setCode: (language, code) =>
        set((state) => ({
          code: { ...state.code, [language]: code },
        })),

      getCode: (language) => get().code[language] || "",

      setSelectedLanguage: (language) => set({ selectedLanguage: language }),

      setTestResults: (results) => set({ testResults: results }),
      setExecutionMetrics: (metrics) => set({ executionMetrics: metrics }),

      setHasUnsavedChanges: (value) => set({ hasUnsavedChanges: value }),
      setLastSaved: (date) => set({ lastSaved: date }),
      setIsRunning: (value) => set({ isRunning: value }),
      setIsTimerRunning: (value) => set({ isTimerRunning: value }),
      setTimeElapsed: (seconds) => set({ timeElapsed: seconds }),
      incrementTimeElapsed: () =>
        set((state) => ({ timeElapsed: state.timeElapsed + 1 })),
      setShowConsole: (value) => set({ showConsole: value }),
      addConsoleOutput: (output) =>
        set((state) => ({
          consoleOutput: [...state.consoleOutput, output],
        })),
      clearConsoleOutput: () => set({ consoleOutput: [] }),
      setIsFullscreen: (value) => set({ isFullscreen: value }),

      setCvText: (text) => set({ cvText: text }),
      setJobDescriptionText: (text) => set({ jobDescriptionText: text }),
      setSelectedDifficulty: (difficulty) =>
        set({ selectedDifficulty: difficulty }),

      resetCode: (language, defaultCode) =>
        set((state) => ({
          code: { ...state.code, [language]: defaultCode },
          testResults: [],
          hasUnsavedChanges: false,
        })),

      reset: () => set(initialState),
    }),
    { name: "CodeChallengeStore" },
  ),
);
