import { useMockInterviewStore } from '@/store/mock-interview-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, Send } from 'lucide-react';
import { useState } from 'react';

export function AnswerInputComponent() {
  const {
    questions,
    currentQuestionIndex,
    answers,
    updateAnswer,
    submitAnswer,
    isLoading,
  } = useMockInterviewStore();

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!questions || questions.length === 0) return null;

  const currentQuestion = questions[currentQuestionIndex];
  if (!currentQuestion) return null;

  const currentAnswer = answers[currentQuestion.id] || '';

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await submitAnswer(currentQuestion.id, currentAnswer);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-lg">Your Answer</CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-4">
        <Textarea
          placeholder="Type your answer here... (You can speak and it will be transcribed automatically)"
          value={currentAnswer}
          onChange={(e) => updateAnswer(currentQuestion.id, e.target.value)}
          className="flex-1 min-h-[200px] resize-none"
          disabled={isLoading || isSubmitting}
        />

        <div className="flex gap-2">
          <Button
            onClick={handleSubmit}
            disabled={!currentAnswer.trim() || isLoading || isSubmitting}
            className="flex-1"
            size="lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Submit Answer
              </>
            )}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          💡 Tip: Press Cmd/Ctrl + Enter to quickly submit your answer
        </p>
      </CardContent>
    </Card>
  );
}
