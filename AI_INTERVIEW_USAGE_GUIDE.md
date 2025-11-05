# AI Interview System - Usage Guide

## Overview
The AI Interview System uses Google Gemini AI to generate personalized interview questions based on the candidate's CV and the job description. It provides real-time evaluation, feedback, and a comprehensive final assessment.

## Features
✅ **Automated Question Generation**: 20 questions (12 technical + 8 behavioral) tailored to the job and candidate
✅ **Real-time Evaluation**: Each answer is scored 0-10 with detailed feedback
✅ **Final Assessment**: Comprehensive report with hiring recommendations
✅ **Multiple Input Methods**: 
  - Upload PDF/TXT files for job description and CV
  - Scrape job details from LinkedIn URLs
  - Manual text entry
✅ **HeyGen Avatar Integration**: AI avatar can ask questions (requires setup)
✅ **Progress Tracking**: Visual progress bars and question counters

## How to Use

### 1. Start the Interview
1. Click the **"Start Interview"** button on the main page
2. The setup dialog will appear

### 2. Provide Job Information
Choose one of these methods:

#### Option A: Upload File
- Click the file upload button under "Job Description"
- Select a PDF or TXT file containing the job posting
- The system will extract and display the text

#### Option B: LinkedIn Scraping
- Paste a LinkedIn job URL in the "LinkedIn URL" field
- Click **"Scrape from LinkedIn"**
- Wait for the job details to be extracted

#### Option C: Manual Entry
- Type or paste the job description directly in the text area

### 3. Provide Candidate Skills/CV
Choose one of these methods:

#### Option A: Upload CV
- Click the file upload button under "Employee Skills & CV"
- Select a PDF or TXT file containing the candidate's CV
- The system will extract and display the text

#### Option B: Manual Entry
- Type or paste the candidate's skills and experience directly

### 4. Generate Questions & Start Interview
1. Click **"Start Interview"** at the bottom of the dialog
2. The system will:
   - Send job description + CV to Gemini AI
   - Generate 20 personalized interview questions
   - Display the first question

### 5. Answer Questions
For each question:
1. Read the question carefully
2. Type your answer in the text area
3. (Optional) Click **"Show Hints"** for evaluation criteria
4. Click **"Submit Answer"**
5. Wait for AI evaluation (~2-3 seconds)
6. The system automatically moves to the next question

**Progress Tracking:**
- Top right corner shows: "Question X of 20"
- Progress bar shows interview completion percentage

### 6. View Final Assessment
After answering all 20 questions:
1. The system automatically generates a final assessment
2. You'll see:
   - **Overall Score**: Percentage and rating
   - **Confidence Level**: AI's confidence in the assessment
   - **Hiring Recommendation**: Recommendation with reasoning
   - **Key Strengths**: List of identified strengths
   - **Development Areas**: Areas for improvement
   - **Detailed Feedback**: Breakdown by technical, behavioral, and communication skills
   - **Next Steps**: Recommended actions
   - **Question Breakdown**: Individual scores and feedback for each question

### 7. Post-Interview Actions
- **Start New Interview**: Click to begin a fresh interview
- **Download Report**: Save the assessment (coming soon)

## Optional Features

### HeyGen Avatar
If HeyGen is configured:
1. Click the **"AI Avatar"** button during the interview
2. The avatar will appear in a video window
3. Type the question in the avatar's input field to make it speak
4. (Manual control - automatic question reading coming soon)

### Hints and Tips
- Click **"Show Hints"** to see evaluation criteria for each question
- These criteria show what the AI is looking for in your answer
- Use them to structure comprehensive responses

## Tips for Best Results

### For Job Descriptions:
- Include complete job requirements
- List required technical skills
- Mention soft skills and qualifications
- Add company culture information if available

### For CVs:
- Include all relevant experience
- List technical skills and proficiencies
- Mention projects and achievements
- Include education and certifications

### For Answers:
- **Be specific**: Use concrete examples
- **Quantify**: Include numbers and metrics when possible
- **Structure**: Use STAR method (Situation, Task, Action, Result) for behavioral questions
- **Technical depth**: Show understanding of concepts, not just memorization
- **Be honest**: AI can detect vague or generic answers

## Scoring System

### Individual Questions (0-10 scale)
- **9-10**: Excellent - Comprehensive answer covering all key points
- **7-8**: Good - Solid answer with minor gaps
- **5-6**: Adequate - Basic understanding but missing details
- **3-4**: Weak - Significant gaps in knowledge or explanation
- **0-2**: Poor - Incomplete or incorrect answer

### Overall Assessment
- **Total Score**: Sum of all question scores
- **Percentage**: (Total Score / 200) × 100
- **Confidence Level**: AI's confidence in the assessment (1-100%)

### Hiring Recommendations
- **Strong Hire**: Excellent performance across categories
- **Hire**: Good performance with minor areas for improvement
- **Maybe**: Mixed performance, requires further evaluation
- **No Hire**: Significant gaps in required skills

## Technical Details

### API Endpoints Used
1. `/api/extract-pdf` - Extracts text from PDF files
2. `/api/scrape-linkedin` - Scrapes LinkedIn job postings
3. `/api/generate-questions` - Generates 20 interview questions
4. `/api/evaluate-answer` - Evaluates individual answers
5. `/api/final-assessment` - Generates comprehensive final report

### Data Flow
```
User Uploads CV + Job Description
         ↓
    Parse/Extract Text
         ↓
   Send to Gemini API
         ↓
 Generate 20 Questions
         ↓
   Display Question 1
         ↓
   User Answers ← ─┐
         ↓          │
  Evaluate Answer   │
         ↓          │
  Show Feedback     │
         ↓          │
  Next Question ──→─┘
         ↓
  (After 20 questions)
         ↓
 Generate Final Assessment
         ↓
   Show Report
```

### Response Times
- **Question Generation**: 10-15 seconds for all 20 questions
- **Answer Evaluation**: 2-3 seconds per answer
- **Final Assessment**: 5-10 seconds

## Troubleshooting

### "Failed to generate questions"
- **Cause**: Empty job description or CV
- **Solution**: Make sure both fields have content before starting

### "Failed to evaluate answer"
- **Cause**: Network error or API timeout
- **Solution**: Check internet connection and try again

### PDF extraction not working
- **Cause**: Corrupted or unsupported PDF format
- **Solution**: Try converting to TXT or use manual entry

### LinkedIn scraping fails
- **Cause**: Invalid URL or LinkedIn changes
- **Solution**: Copy job description manually

### Long wait times
- **Cause**: Gemini API processing
- **Solution**: Wait patiently - complex evaluations take time

## Future Enhancements

### Planned Features
- ✨ Voice recording for answers
- ✨ Automatic HeyGen avatar question reading
- ✨ Download PDF reports
- ✨ Share results via email
- ✨ Save and resume interviews
- ✨ Multiple interview sessions comparison
- ✨ Custom question sets
- ✨ Industry-specific templates

## Support

For issues or questions:
1. Check this guide first
2. Review AI_INTERVIEW_PLAN.md for technical details
3. Check console logs for error messages
4. Verify Gemini API key is configured in .env.local

## Configuration

Required environment variables:
```env
GEMINI_API_KEY=your_api_key_here
NEXT_PUBLIC_GEMINI_API_KEY=your_api_key_here
```

Optional (for HeyGen avatar):
```env
HEYGEN_API_KEY=your_heygen_key_here
```

## Privacy & Data

- **Question Generation**: Job description and CV are sent to Google Gemini API
- **Answer Evaluation**: User answers are sent to Gemini for scoring
- **Data Storage**: Currently, no data is permanently stored (session-only)
- **Security**: All API calls are made server-side to protect API keys

## Best Practices

1. **Preparation**: Have your CV and job description ready
2. **Environment**: Find a quiet space with good internet
3. **Time**: Set aside 45-60 minutes for the full interview
4. **Focus**: Treat it like a real interview - no distractions
5. **Honesty**: Provide genuine answers for accurate feedback
6. **Review**: Read the final assessment carefully for improvement areas

---

**Note**: This system is designed for practice and preparation. Real interviews may differ in format and expectations. Use the feedback to improve your skills and confidence.
