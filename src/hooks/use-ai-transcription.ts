"use client";

import { useEffect, useRef, useCallback, useState } from 'react';
import { useInterviewStore } from './use-interview-store';

// Type definitions for Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

declare global {
  interface Window {
    SpeechRecognition?: typeof SpeechRecognition;
    webkitSpeechRecognition?: typeof SpeechRecognition;
  }
}

export function useAITranscription() {
  const { addTranscript, addAIInsight, setAIAnalyzing } = useInterviewStore();
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const analysisTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const [isListening, setIsListening] = useState(false);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Use standard Web Speech API, fall back to webkit if needed
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.warn('Web Speech API not supported in this browser');
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'en-US';

    recognitionRef.current.onstart = () => {
      setIsListening(true);
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current.onresult = (event: Event) => {
      const speechEvent = event as unknown as SpeechRecognitionEvent;
      const last = speechEvent.results.length - 1;
      const transcript = speechEvent.results[last][0].transcript;
      const confidence = speechEvent.results[last][0].confidence;
      const isFinal = speechEvent.results[last].isFinal;

      if (isFinal && transcript.trim()) {
        // Send to backend for validation and storage
        sendTranscriptionToBackend(transcript, confidence);
      }
    };

    recognitionRef.current.onerror = (event: Event) => {
      const errorEvent = event as unknown as SpeechRecognitionErrorEvent;
      console.error('Speech recognition error:', errorEvent.error);
    };

    return () => {
      if (analysisTimeoutRef.current) {
        clearTimeout(analysisTimeoutRef.current);
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Send transcription to backend
  const sendTranscriptionToBackend = useCallback(async (text: string, confidence: number) => {
    try {
      const response = await fetch('/api/transcribe-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, confidence }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Add to interview store
        const entry = {
          id: `transcript-${Date.now()}`,
          participantId: 'local',
          participantName: 'You',
          text: data.text,
          timestamp: new Date(),
          confidence: data.confidence || 0.9,
        };
        addTranscript(entry);
        
        // Trigger AI analysis after a short delay
        if (analysisTimeoutRef.current) {
          clearTimeout(analysisTimeoutRef.current);
        }
        analysisTimeoutRef.current = setTimeout(() => {
          analyzeTranscript(data.text);
        }, 2000);
      }
    } catch (error) {
      console.error('Failed to send transcription to backend:', error);
    }
  }, [addTranscript]);

  // Analyze transcript with AI
  const analyzeTranscript = useCallback(async (text: string) => {
    setAIAnalyzing(true);
    
    try {
      // Call AI analysis API
      const response = await fetch('/api/ai/analyze-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Add insights from AI analysis
        if (data.insights && Array.isArray(data.insights)) {
          data.insights.forEach((insight: {
            type?: string;
            category?: string;
            message: string;
            confidence?: number;
          }) => {
            const validType = ['positive', 'neutral', 'suggestion'].includes(insight.type || '')
              ? (insight.type as 'positive' | 'neutral' | 'suggestion')
              : 'neutral';
            const validCategory = ['communication', 'technical', 'behavioral', 'overall'].includes(insight.category || '')
              ? (insight.category as 'communication' | 'technical' | 'behavioral' | 'overall')
              : 'overall';

            addAIInsight({
              type: validType,
              category: validCategory,
              message: insight.message,
              timestamp: new Date(),
              confidence: insight.confidence || 0.8,
            });
          });
        }
      }
    } catch (error) {
      console.error('AI analysis error:', error);
    } finally {
      setAIAnalyzing(false);
    }
  }, [addAIInsight, setAIAnalyzing]);

  // Start transcription
  const startTranscription = useCallback(() => {
    if (!recognitionRef.current) {
      console.warn('Speech recognition not initialized');
      return;
    }

    try {
      // Reset continuous mode for better UX
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.start();
    } catch (error) {
      console.error('Failed to start transcription:', error);
    }
  }, []);

  // Stop transcription
  const stopTranscription = useCallback(() => {
    if (!recognitionRef.current) return;

    try {
      recognitionRef.current.stop();
    } catch (error) {
      console.error('Failed to stop transcription:', error);
    }
  }, []);

  // Abort transcription
  const abortTranscription = useCallback(() => {
    if (!recognitionRef.current) return;

    try {
      recognitionRef.current.abort();
      setIsListening(false);
    } catch (error) {
      console.error('Failed to abort transcription:', error);
    }
  }, []);

  return {
    startTranscription,
    stopTranscription,
    abortTranscription,
    analyzeTranscript,
    isListening,
  };
}
