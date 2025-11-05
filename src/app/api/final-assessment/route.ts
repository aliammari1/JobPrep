import { NextRequest, NextResponse } from "next/server";
import { generateWithOllamaRetry, cleanJsonResponse } from "@/lib/ollama-client";

export const runtime = 'nodejs';

interface QuestionResult {
  question: string;
  userAnswer: string;
  score: number;
  evaluation: any;
}

export async function POST(request: NextRequest) {
  try {
    const { results } = await request.json() as { results: QuestionResult[] };

    if (!results || !Array.isArray(results) || results.length === 0) {
      return NextResponse.json(
        { error: "Results array is required" },
        { status: 400 }
      );
    }

    // Calculate statistics
    const totalQuestions = results.length;
    const totalScore = results.reduce((sum, r) => sum + r.score, 0);
    const averageScore = totalScore / totalQuestions;
    const percentage = (averageScore / 10) * 100;

    // Categorize by question type
    const technicalQuestions = results.filter((_, i) => i < 12); // First 12 are technical
    const behavioralQuestions = results.filter((_, i) => i >= 12); // Last 8 are behavioral

    const technicalScore = technicalQuestions.length > 0 
      ? technicalQuestions.reduce((sum, r) => sum + r.score, 0) / technicalQuestions.length 
      : 0;
    const behavioralScore = behavioralQuestions.length > 0
      ? behavioralQuestions.reduce((sum, r) => sum + r.score, 0) / behavioralQuestions.length
      : 0;

    // Get all strengths and weaknesses
    const allStrengths = results.flatMap(r => r.evaluation?.strengths || []);
    const allWeaknesses = results.flatMap(r => r.evaluation?.weaknesses || []);

    const prompt = `You are a REALISTIC senior interview assessor. Generate a comprehensive final assessment based on actual performance.

INTERVIEW STATISTICS:
- Total Questions: ${totalQuestions}
- Average Score: ${averageScore.toFixed(2)}/10 (${percentage.toFixed(1)}%)
- Technical Score: ${technicalScore.toFixed(2)}/10
- Behavioral Score: ${behavioralScore.toFixed(2)}/10

TOP STRENGTHS IDENTIFIED:
${allStrengths.slice(0, 10).join('\n') || 'None identified'}

AREAS FOR IMPROVEMENT:
${allWeaknesses.slice(0, 10).join('\n') || 'Many areas need improvement'}

CRITICAL ASSESSMENT RULES:
- Average 0-3: "Poor" → "Strong No" hiring recommendation
- Average 3-5: "Needs Improvement" → "No" hiring recommendation  
- Average 5-7: "Fair" → "Maybe" hiring recommendation
- Average 7-8: "Good" → "Yes" hiring recommendation
- Average 8-10: "Very Good/Excellent" → "Strong Yes" hiring recommendation

BE HONEST AND REALISTIC. If scores are low, the assessment should reflect that clearly.

Generate final assessment in this JSON format (NO markdown, NO code blocks):
{
  "overallRating": "Excellent or Very Good or Good or Fair or Needs Improvement or Poor",
  "hiringRecommendation": "Strong Yes or Yes or Maybe or No or Strong No",
  "summary": "3-4 sentence HONEST summary based on actual scores and performance",
  "keyStrengths": ["real strength1 if any", "real strength2 if any", "real strength3 if any"],
  "keyWeaknesses": ["specific weakness1", "specific weakness2", "specific weakness3"],
  "detailedFeedback": {
    "technical": "2-3 sentences about technical performance based on actual scores",
    "behavioral": "2-3 sentences about behavioral performance based on actual scores",
    "communication": "2-3 sentences about communication quality observed"
  },
  "developmentAreas": ["specific area1 to improve", "specific area2 to improve", "specific area3 to improve"],
  "nextSteps": ["actionable recommendation1", "actionable recommendation2"],
  "confidenceLevel": ${Math.round(50 + (averageScore * 5))}
}

Return ONLY the JSON. Be HONEST - if performance was poor (low scores), say so clearly!`;

    console.log("Generating final assessment with Ollama (local & fast)...");
    let text;
    try {
      text = await generateWithOllamaRetry(prompt);
    } catch (error: any) {
      console.error("Failed to generate AI assessment after retries:", error);
      
      // Return statistics-based assessment if AI fails
      const rating = averageScore >= 8 ? "Very Good" : averageScore >= 6 ? "Good" : averageScore >= 4 ? "Fair" : "Needs Improvement";
      const recommendation = averageScore >= 8 ? "Yes" : averageScore >= 6 ? "Maybe" : "No";
      
      return NextResponse.json({
        success: true,
        statistics: {
          totalQuestions,
          averageScore: averageScore.toFixed(2),
          percentage: percentage.toFixed(1),
          technicalScore: technicalScore.toFixed(2),
          behavioralScore: behavioralScore.toFixed(2),
        },
        assessment: {
          overallRating: rating,
          hiringRecommendation: recommendation,
          summary: `Interview completed with ${totalQuestions} questions. Overall performance: ${averageScore.toFixed(1)}/10 (${percentage.toFixed(1)}%). Technical: ${technicalScore.toFixed(1)}/10, Behavioral: ${behavioralScore.toFixed(1)}/10. AI evaluation service was temporarily unavailable, but your answers have been recorded.`,
          keyStrengths: allStrengths.slice(0, 3).length > 0 ? allStrengths.slice(0, 3) : ["Interview completed", "All questions answered", "Engaged with the process"],
          keyWeaknesses: allWeaknesses.slice(0, 3).length > 0 ? allWeaknesses.slice(0, 3) : ["Review detailed feedback for each question", "Practice more technical questions", "Work on response completeness"],
          detailedFeedback: {
            technical: `Technical performance was ${technicalScore.toFixed(1)}/10. ${technicalScore >= 7 ? 'Strong technical foundation demonstrated.' : 'Continue building technical skills.'}`,
            behavioral: `Behavioral performance was ${behavioralScore.toFixed(1)}/10. ${behavioralScore >= 7 ? 'Good understanding of workplace scenarios.' : 'Focus on developing soft skills.'}`,
            communication: `Communication skills were evaluated throughout the interview based on answer clarity and completeness.`
          },
          developmentAreas: ["Review individual question feedback", "Practice similar interview questions", "Focus on weaker areas identified"],
          nextSteps: ["Review detailed feedback for each answer", "Continue practicing interview skills", "Apply learnings to future interviews"],
          confidenceLevel: 70
        }
      });
    }
    
    const cleanedText = cleanJsonResponse(text);

    console.log("Final assessment response length:", text.length);
    console.log("Cleaned JSON preview:", cleanedText.substring(0, 300));

    let assessment;
    try {
      assessment = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError);
      console.error("Full cleaned text:", cleanedText);
      
      // Create a default assessment on parse error
      assessment = {
        overallRating: averageScore >= 7 ? "Good" : averageScore >= 5 ? "Fair" : "Needs Improvement",
        hiringRecommendation: averageScore >= 7 ? "Yes" : averageScore >= 5 ? "Maybe" : "No",
        summary: `The candidate completed ${totalQuestions} questions with an average score of ${averageScore.toFixed(1)}/10 (${percentage.toFixed(1)}%). Technical performance: ${technicalScore.toFixed(1)}/10. Behavioral performance: ${behavioralScore.toFixed(1)}/10.`,
        keyStrengths: allStrengths.slice(0, 3),
        keyWeaknesses: allWeaknesses.slice(0, 3),
        detailedFeedback: {
          technical: `Technical score was ${technicalScore.toFixed(1)}/10.`,
          behavioral: `Behavioral score was ${behavioralScore.toFixed(1)}/10.`,
          communication: "Communication skills were evaluated throughout the interview."
        },
        developmentAreas: ["Continue practicing", "Review feedback", "Focus on weak areas"],
        nextSteps: ["Review detailed feedback", "Practice more interviews"],
        confidenceLevel: 70
      };
    }

    return NextResponse.json({
      success: true,
      statistics: {
        totalQuestions,
        averageScore: averageScore.toFixed(2),
        percentage: percentage.toFixed(1),
        technicalScore: technicalScore.toFixed(2),
        behavioralScore: behavioralScore.toFixed(2),
      },
      assessment,
    });

  } catch (error) {
    console.error("Error generating final assessment:", error);
    return NextResponse.json(
      { 
        error: "Failed to generate final assessment",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
