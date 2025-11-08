# AI Interview Flow Implementation Plan

## System Architecture

### APIs Created:
1. **`/api/generate-questions`** - Generates 20 questions (12 technical + 8 behavioral) based on job description and employee skills
2. **`/api/evaluate-answer`** - Evaluates each answer with scoring and feedback
3. **`/api/final-assessment`** - Generates comprehensive final report with statistics

### Data Flow:
```
1. User uploads CV/Job Description → Parse files (pdf-parse, LinkedIn scraping)
2. Send to Gemini → Generate 20 questions + ideal answers
3. HeyGen Avatar asks questions one by one
4. User answers (text/voice)
5. Answer sent to Gemini → Get evaluation + score
6. Repeat 20 times
7. Generate final assessment with all results
8. Display score, feedback, and recommendations
```

### State Management (New Variables Needed):
```typescript
- generatedQuestions: Array of questions from Gemini
- currentQuestionIndex: Current question number (0-19)
- interviewResults: Array storing {question, userAnswer, idealAnswer, score, evaluation}
- isGeneratingQuestions: Loading state
- finalAssessment: Final report data
- showFinalReport: Display final report dialog
```

### Components to Update:
1. **Setup Dialog** - Already done ✅
2. **Question Generation** - Call `/api/generate-questions` after setup
3. **Interview Interface** - Display current question, accept answer
4. **HeyGen Integration** - Avatar speaks questions
5. **Answer Submission** - Text input + voice recording
6. **Progress Tracking** - Show question X/20
7. **Final Report** - Display comprehensive assessment

### Key Functions:
```typescript
handleSetupComplete() {
  // 1. Close setup dialog
  // 2. Call /api/generate-questions
  // 3. Start interview with question 1
  // 4. Initialize HeyGen avatar
}

handleNextQuestion() {
  // 1. Evaluate current answer via /api/evaluate-answer
  // 2. Store result
  // 3. Move to next question or finish
  // 4. Avatar speaks next question
}

handleInterviewComplete() {
  // 1. Call /api/final-assessment with all results
  // 2. Display final report
  // 3. Show scores, feedback, recommendations
}
```

### UI Components:
- Question display with progress bar
- Answer input (textarea + voice button)
- Real-time feedback after each answer
- Final assessment dashboard with charts
- Download report button

## Implementation Steps:
1. ✅ Add Gemini API key to .env
2. ✅ Create /api/generate-questions
3. ✅ Create /api/evaluate-answer  
4. ✅ Create /api/final-assessment
5. ⏳ Update page.tsx with new state variables
6. ⏳ Implement question generation flow
7. ⏳ Implement interview question-answer loop
8. ⏳ Integrate HeyGen avatar speech
9. ⏳ Implement final assessment display
10. ⏳ Add voice recording capability

## Next: Implement the full interview flow in page.tsx
