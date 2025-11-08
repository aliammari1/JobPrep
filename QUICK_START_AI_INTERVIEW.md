# 🚀 Quick Start Guide - AI Interview System

## ⚡ Start Using in 3 Steps

### 1️⃣ Prepare Your Files
Have ready:
- **Job Description** (PDF, TXT, or LinkedIn URL)
- **Your CV/Resume** (PDF or TXT)

### 2️⃣ Start Interview
```
1. Open http://localhost:3000/mock-interview
2. Click "Start Interview"
3. Upload job description (or paste LinkedIn URL)
4. Upload your CV (or paste text)
5. Click "Start Interview" again
```

### 3️⃣ Complete Interview
```
- Answer 20 questions (type in textarea)
- Click "Submit Answer" after each
- Wait for AI evaluation
- Review final assessment
```

## 🎯 Key Features

| Feature | Description | Time |
|---------|-------------|------|
| **Setup** | Upload files or scrape LinkedIn | 1-2 min |
| **Generation** | AI creates 20 questions | 10-15 sec |
| **Interview** | Answer all questions | 30-45 min |
| **Evaluation** | AI scores each answer | 2-3 sec each |
| **Report** | Comprehensive assessment | 5-10 sec |

## 📊 What You Get

### Individual Questions (0-10 each)
- ✅ Score with detailed feedback
- ✅ Strengths identified
- ✅ Areas for improvement
- ✅ Specific suggestions

### Final Report Includes:
- 📈 Overall percentage score
- 🎯 Hiring recommendation
- 💪 Key strengths (top 5+)
- 📚 Development areas
- 🔍 Detailed breakdown (technical/behavioral/communication)
- 📝 Next steps (prioritized)
- 📋 Question-by-question results

## 🔧 Configuration

### Required (.env.local):
```env
GEMINI_API_KEY=AIzaSyC2QVCoUUKUTFiGnnO_dJv3AzYf_Kb6nm8
NEXT_PUBLIC_GEMINI_API_KEY=AIzaSyC2QVCoUUKUTFiGnnO_dJv3AzYf_Kb6nm8
```

### Optional (for HeyGen avatar):
```env
HEYGEN_API_KEY=your_key_here
```

## ⚠️ Important Notes

### Do's ✅
- ✅ Provide complete job descriptions
- ✅ Include all relevant skills in CV
- ✅ Answer thoughtfully and specifically
- ✅ Use STAR method for behavioral questions
- ✅ Allow 45-60 minutes for full interview

### Don'ts ❌
- ❌ Don't leave fields empty
- ❌ Don't skip questions
- ❌ Don't rush through answers
- ❌ Don't close browser during interview
- ❌ Don't use vague or generic responses

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| Can't generate questions | Check both job description AND CV are filled |
| PDF won't upload | Try converting to TXT or use manual entry |
| LinkedIn scraping fails | Copy job description manually |
| Long wait times | Normal - AI processing takes time |
| Evaluation stuck | Refresh page and start over |

## 📖 Full Documentation

For detailed information, see:
- **AI_INTERVIEW_USAGE_GUIDE.md** - Complete user manual
- **AI_INTERVIEW_PLAN.md** - Technical architecture
- **AI_INTERVIEW_IMPLEMENTATION_COMPLETE.md** - Implementation details

## 🎓 Tips for Best Scores

### Technical Questions
- Show deep understanding, not just definitions
- Explain trade-offs and alternatives
- Use real examples from your experience
- Mention specific tools/technologies

### Behavioral Questions
- Use STAR method:
  - **S**ituation: Set the context
  - **T**ask: Explain the challenge
  - **A**ction: Describe what you did
  - **R**esult: Share the outcome
- Quantify impact (numbers, percentages)
- Be specific about your role
- Highlight learnings

### Communication
- Be clear and concise
- Structure your answers
- Avoid rambling
- Stay focused on the question

## 🚀 Getting Started Now

```bash
# 1. Make sure dev server is running
npm run dev

# 2. Open in browser
http://localhost:3000/mock-interview

# 3. Click "Start Interview"

# 4. Follow the prompts!
```

## 📞 Need Help?

1. Check console logs (F12 in browser)
2. Review error messages
3. Verify API keys are set
4. Try with smaller inputs first
5. Restart browser if needed

---

**Ready to Practice?** Click "Start Interview" and let the AI help you prepare! 🎯

*Average interview completion: 45-60 minutes*  
*Questions generated: 20 (12 technical + 8 behavioral)*  
*Evaluation accuracy: High (powered by Gemini AI)*
