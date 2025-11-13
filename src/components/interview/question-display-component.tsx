import { useMockInterviewStore } from '@/store/mock-interview-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Clock, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function QuestionDisplayComponent() {
  const {
    questions,
    currentQuestionIndex,
    currentQuestionTime,
  } = useMockInterviewStore();

  if (!questions || questions.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <AlertCircle className="w-6 h-6 mr-2 text-muted-foreground" />
          <p className="text-muted-foreground">No questions available</p>
        </CardContent>
      </Card>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  if (!currentQuestion) {
    return null;
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30';
      case 'hard':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30';
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between mb-4">
          <div>
            <CardTitle className="text-lg">
              Question {currentQuestionIndex + 1} of {questions.length}
            </CardTitle>
            <Progress value={progress} className="mt-2 h-2" />
          </div>
          {currentQuestion.timeLimit && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>{currentQuestionTime}s / {currentQuestion.timeLimit}s</span>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Badge className={getDifficultyColor(currentQuestion.difficulty)}>
            {currentQuestion.difficulty}
          </Badge>
          <Badge variant="outline">{currentQuestion.category}</Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col">
        <p className="text-base mb-6 whitespace-pre-wrap">
          {currentQuestion.text}
        </p>

        {currentQuestion.feedback && (
          <div className="mt-auto p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm font-medium mb-2">Feedback:</p>
            <p className="text-sm text-muted-foreground">
              {currentQuestion.feedback}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
