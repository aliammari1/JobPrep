import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export interface Question {
  id: string;
  text: string;
  category: 'technical' | 'behavioral' | 'situational';
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit?: number;
  answer?: string;
  feedback?: string;
  score?: number;
}

export interface MockSessionState {
  // Session Info
  sessionId: string;
  title: string;
  type: 'behavioral' | 'technical' | 'leadership' | 'case-study';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  totalDuration: number; // in minutes

  // Timing
  startedAt: number | null;
  sessionTime: number; // elapsed seconds
  currentQuestionTime: number;

  // Questions & Answers
  questions: Question[];
  currentQuestionIndex: number;
  answers: Record<string, string>;
  scores: Record<string, number>;

  // UI State
  isRecording: boolean;
  showTranscript: boolean;
  showFeedback: boolean;
  isLoading: boolean;
  error: string | null;

  // Session State
  isActive: boolean;
  isCompleted: boolean;
  isPaused: boolean;

  // Feedback & Analytics
  overallScore: number;
  strengths: string[];
  improvements: string[];
  transcript: string;

  // Actions
  initSession: (config: Partial<MockSessionState>) => void;
  startSession: () => void;
  pauseSession: () => void;
  resumeSession: () => void;
  endSession: () => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  updateAnswer: (questionId: string, answer: string) => void;
  submitAnswer: (questionId: string, answer: string) => Promise<void>;
  setCurrentQuestionTime: (time: number) => void;
  incrementSessionTime: () => void;
  recordTranscript: (text: string) => void;
  setFeedback: (feedback: { scores: Record<string, number>; strengths: string[]; improvements: string[] }) => void;
  toggleRecording: () => void;
  toggleTranscript: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  sessionId: '',
  title: '',
  type: 'technical' as const,
  difficulty: 'beginner' as const,
  totalDuration: 30,
  startedAt: null,
  sessionTime: 0,
  currentQuestionTime: 0,
  questions: [],
  currentQuestionIndex: 0,
  answers: {},
  scores: {},
  isRecording: false,
  showTranscript: false,
  showFeedback: false,
  isLoading: false,
  error: null,
  isActive: false,
  isCompleted: false,
  isPaused: false,
  overallScore: 0,
  strengths: [],
  improvements: [],
  transcript: '',
};

export const useMockInterviewStore = create<MockSessionState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        initSession: (config) => {
          set({
            sessionId: `session_${Date.now()}`,
            ...config,
          });
        },

        startSession: () => {
          set({
            isActive: true,
            startedAt: Date.now(),
            sessionTime: 0,
          });
        },

        pauseSession: () => {
          set({ isPaused: true, isActive: false });
        },

        resumeSession: () => {
          set({ isPaused: false, isActive: true });
        },

        endSession: () => {
          set({
            isActive: false,
            isCompleted: true,
            isRecording: false,
          });
        },

        nextQuestion: () => {
          const { currentQuestionIndex, questions } = get();
          if (currentQuestionIndex < questions.length - 1) {
            set({
              currentQuestionIndex: currentQuestionIndex + 1,
              currentQuestionTime: 0,
            });
          }
        },

        previousQuestion: () => {
          const { currentQuestionIndex } = get();
          if (currentQuestionIndex > 0) {
            set({
              currentQuestionIndex: currentQuestionIndex - 1,
              currentQuestionTime: 0,
            });
          }
        },

        updateAnswer: (questionId, answer) => {
          set((state) => ({
            answers: {
              ...state.answers,
              [questionId]: answer,
            },
          }));
        },

        submitAnswer: async (questionId, answer) => {
          set({ isLoading: true, error: null });
          try {
            set((state) => ({
              answers: {
                ...state.answers,
                [questionId]: answer,
              },
            }));

            // Call evaluation API
            const response = await fetch('/api/evaluate-answer', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                questionId,
                answer,
                sessionId: get().sessionId,
              }),
            });

            if (!response.ok) throw new Error('Failed to evaluate answer');

            const { score, feedback } = await response.json();
            set((state) => ({
              scores: {
                ...state.scores,
                [questionId]: score,
              },
            }));
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'Evaluation failed',
            });
          } finally {
            set({ isLoading: false });
          }
        },

        setCurrentQuestionTime: (time) => {
          set({ currentQuestionTime: time });
        },

        incrementSessionTime: () => {
          set((state) => ({
            sessionTime: state.sessionTime + 1,
          }));
        },

        recordTranscript: (text) => {
          set((state) => ({
            transcript: state.transcript + ' ' + text,
          }));
        },

        setFeedback: (feedback) => {
          const allScores = Object.values(feedback.scores);
          const overallScore =
            allScores.length > 0
              ? allScores.reduce((a, b) => a + b, 0) / allScores.length
              : 0;

          set({
            scores: feedback.scores,
            strengths: feedback.strengths,
            improvements: feedback.improvements,
            overallScore,
            showFeedback: true,
          });
        },

        toggleRecording: () => {
          set((state) => ({
            isRecording: !state.isRecording,
          }));
        },

        toggleTranscript: () => {
          set((state) => ({
            showTranscript: !state.showTranscript,
          }));
        },

        setLoading: (loading) => {
          set({ isLoading: loading });
        },

        setError: (error) => {
          set({ error });
        },

        reset: () => {
          set(initialState);
        },
      }),
      {
        name: 'mock-interview-storage',
      }
    )
  )
);
