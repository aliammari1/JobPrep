"use client";

import { create } from 'zustand';

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: Date;
  type: 'message' | 'note' | 'question';
}

export interface AIInsight {
  type: 'positive' | 'neutral' | 'suggestion';
  category: 'communication' | 'technical' | 'behavioral' | 'overall';
  message: string;
  timestamp: Date;
  confidence: number;
}

export interface TranscriptEntry {
  id: string;
  participantId: string;
  participantName: string;
  text: string;
  timestamp: Date;
  confidence: number;
}

interface InterviewState {
  // Recording state
  isRecording: boolean;
  recordingTime: number;
  recordingStartTime: number | null;
  
  // Chat and notes
  chatMessages: ChatMessage[];
  notes: string[];
  
  // AI features
  aiInsights: AIInsight[];
  transcripts: TranscriptEntry[];
  isAIAnalyzing: boolean;
  
  // Actions
  startRecording: () => void;
  stopRecording: () => void;
  updateRecordingTime: (time: number) => void;
  
  addChatMessage: (message: ChatMessage) => void;
  addNote: (note: string) => void;
  
  addAIInsight: (insight: AIInsight) => void;
  addTranscript: (transcript: TranscriptEntry) => void;
  setAIAnalyzing: (analyzing: boolean) => void;
  
  clearAll: () => void;
}

export const useInterviewStore = create<InterviewState>((set) => ({
  // Initial state
  isRecording: false,
  recordingTime: 0,
  recordingStartTime: null,
  chatMessages: [],
  notes: [],
  aiInsights: [],
  transcripts: [],
  isAIAnalyzing: false,
  
  // Recording actions
  startRecording: () => set({ 
    isRecording: true, 
    recordingStartTime: Date.now(),
    recordingTime: 0 
  }),
  
  stopRecording: () => set({ 
    isRecording: false,
    recordingStartTime: null 
  }),
  
  updateRecordingTime: (time) => set({ recordingTime: time }),
  
  // Chat and notes actions
  addChatMessage: (message) => set((state) => ({
    chatMessages: [...state.chatMessages, message]
  })),
  
  addNote: (note) => set((state) => ({
    notes: [...state.notes, note]
  })),
  
  // AI actions
  addAIInsight: (insight) => set((state) => ({
    aiInsights: [...state.aiInsights, insight]
  })),
  
  addTranscript: (transcript) => set((state) => ({
    transcripts: [...state.transcripts, transcript]
  })),
  
  setAIAnalyzing: (analyzing) => set({ isAIAnalyzing: analyzing }),
  
  // Clear all
  clearAll: () => set({
    chatMessages: [],
    notes: [],
    aiInsights: [],
    transcripts: [],
    isRecording: false,
    recordingTime: 0,
    recordingStartTime: null,
    isAIAnalyzing: false,
  }),
}));
