"use client";

import { useEffect, useRef, useCallback } from 'react';
import { useInterviewStore } from './use-interview-store';

export function useAITranscription() {
  const { addTranscript, addAIInsight, setAIAnalyzing } = useInterviewStore();
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const analysisTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognitionConstructor = window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognitionConstructor();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        const last = event.results.length - 1;
        const transcript = event.results[last][0].transcript;
        const confidence = event.results[last][0].confidence;
        const isFinal = event.results[last].isFinal;

        if (isFinal) {
          const entry = {
            id: `transcript-${Date.now()}`,
            participantId: 'local',
            participantName: 'You',
            text: transcript,
            timestamp: new Date(),
            confidence: confidence || 0.9,
          };
          addTranscript(entry);
          
          // Trigger AI analysis after a short delay
          if (analysisTimeoutRef.current) {
            clearTimeout(analysisTimeoutRef.current);
          }
          analysisTimeoutRef.current = setTimeout(() => {
            analyzeTranscript(transcript);
          }, 2000);
        }
      };

      recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
      };
    }

    return () => {
      if (analysisTimeoutRef.current) {
        clearTimeout(analysisTimeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error('Failed to start transcription:', error);
      }
    }
  }, []);

  // Stop transcription
  const stopTranscription = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.error('Failed to stop transcription:', error);
      }
    }
  }, []);

  return {
    startTranscription,
    stopTranscription,
    analyzeTranscript,
  };
}
