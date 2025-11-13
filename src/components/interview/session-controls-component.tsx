import { useMockInterviewStore } from '@/store/mock-interview-store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  StopCircle,
  Clock,
  Mic,
  MicOff,
} from 'lucide-react';
import { useState, useEffect } from 'react';

export function SessionControlsComponent() {
  const {
    isActive,
    isPaused,
    isRecording,
    sessionTime,
    startSession,
    pauseSession,
    resumeSession,
    endSession,
    nextQuestion,
    previousQuestion,
    toggleRecording,
    questions,
    currentQuestionIndex,
    incrementSessionTime,
  } = useMockInterviewStore();

  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes default

  // Timer effect
  useEffect(() => {
    if (!isActive || isPaused) return;

    const interval = setInterval(() => {
      incrementSessionTime();
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, isPaused, incrementSessionTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  const isTimeUp = timeLeft === 0;

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        {/* Timer */}
        <div className="text-center">
          <div
            className={`text-3xl font-mono font-bold ${
              isTimeUp
                ? 'text-red-600'
                : timeLeft < 300
                  ? 'text-yellow-600'
                  : 'text-green-600'
            }`}
          >
            {formatTime(timeLeft)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Time remaining
          </p>
        </div>

        {/* Elapsed time */}
        <div className="text-center text-sm text-muted-foreground">
          <Clock className="w-4 h-4 inline mr-1" />
          Elapsed: {formatTime(sessionTime)}
        </div>

        {/* Session State Badge */}
        <div className="flex justify-center">
          <Badge
            variant={
              isActive && !isPaused
                ? 'default'
                : isPaused
                  ? 'secondary'
                  : 'outline'
            }
          >
            {isActive && !isPaused
              ? 'Recording'
              : isPaused
                ? 'Paused'
                : 'Not Started'}
          </Badge>
        </div>

        {/* Control Buttons */}
        <div className="flex gap-2 flex-wrap justify-center">
          {!isActive ? (
            <Button onClick={startSession} size="lg" className="flex-1">
              <Play className="w-4 h-4 mr-2" />
              Start
            </Button>
          ) : (
            <>
              <Button
                onClick={isPaused ? resumeSession : pauseSession}
                variant="outline"
                size="lg"
              >
                {isPaused ? (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Resume
                  </>
                ) : (
                  <>
                    <Pause className="w-4 h-4 mr-2" />
                    Pause
                  </>
                )}
              </Button>
              <Button
                onClick={endSession}
                variant="destructive"
                size="lg"
              >
                <StopCircle className="w-4 h-4 mr-2" />
                End
              </Button>
            </>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-2 justify-center">
          <Button
            onClick={previousQuestion}
            disabled={currentQuestionIndex === 0}
            variant="outline"
            size="sm"
          >
            <SkipBack className="w-4 h-4" />
          </Button>

          <Button variant="outline" size="sm" disabled>
            {currentQuestionIndex + 1} / {questions.length}
          </Button>

          <Button
            onClick={nextQuestion}
            disabled={currentQuestionIndex === questions.length - 1}
            variant="outline"
            size="sm"
          >
            <SkipForward className="w-4 h-4" />
          </Button>
        </div>

        {/* Recording Button */}
        <Button
          onClick={toggleRecording}
          variant={isRecording ? 'destructive' : 'outline'}
          size="sm"
          className="w-full"
        >
          {isRecording ? (
            <>
              <MicOff className="w-4 h-4 mr-2" />
              Stop Recording
            </>
          ) : (
            <>
              <Mic className="w-4 h-4 mr-2" />
              Start Recording
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
