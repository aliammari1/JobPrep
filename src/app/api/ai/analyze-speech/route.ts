import { NextRequest, NextResponse } from 'next/server';

interface AnalysisRequest {
  text: string;
  context?: string;
}

interface AIInsight {
  type: 'positive' | 'neutral' | 'suggestion';
  category: 'communication' | 'technical' | 'behavioral' | 'overall';
  message: string;
  confidence: number;
}

// Simple keyword-based analysis (can be enhanced with actual AI model)
function analyzeText(text: string): AIInsight[] {
  const insights: AIInsight[] = [];
  const lowerText = text.toLowerCase();

  // Communication patterns
  if (lowerText.includes('specifically') || lowerText.includes('for example')) {
    insights.push({
      type: 'positive',
      category: 'communication',
      message: 'Candidate provides specific examples and details',
      confidence: 0.85,
    });
  }

  if (lowerText.split(' ').length < 10 && !lowerText.includes('?')) {
    insights.push({
      type: 'suggestion',
      category: 'communication',
      message: 'Consider asking for more elaboration on the response',
      confidence: 0.75,
    });
  }

  // Technical keywords
  const technicalKeywords = ['algorithm', 'architecture', 'performance', 'scalability', 'optimization'];
  const hasTechnical = technicalKeywords.some(keyword => lowerText.includes(keyword));
  
  if (hasTechnical) {
    insights.push({
      type: 'positive',
      category: 'technical',
      message: 'Discussion includes technical depth',
      confidence: 0.88,
    });
  }

  // Behavioral indicators
  if (lowerText.includes('team') || lowerText.includes('collaboration') || lowerText.includes('together')) {
    insights.push({
      type: 'positive',
      category: 'behavioral',
      message: 'Demonstrates teamwork and collaboration awareness',
      confidence: 0.82,
    });
  }

  if (lowerText.includes('challenge') || lowerText.includes('difficult') || lowerText.includes('problem')) {
    insights.push({
      type: 'neutral',
      category: 'behavioral',
      message: 'Discussing challenges - good opportunity to assess problem-solving',
      confidence: 0.80,
    });
  }

  // Question asking (interviewer)
  if (lowerText.includes('?')) {
    insights.push({
      type: 'neutral',
      category: 'overall',
      message: 'Open-ended question detected - allows for detailed response',
      confidence: 0.90,
    });
  }

  return insights;
}

export async function POST(request: NextRequest) {
  try {
    const body: AnalysisRequest = await request.json();
    const { text } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    // Perform analysis
    const insights = analyzeText(text);

    return NextResponse.json({
      insights,
      analyzedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('AI analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze text' },
      { status: 500 }
    );
  }
}
