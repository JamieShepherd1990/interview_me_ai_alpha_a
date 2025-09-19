import { VercelRequest, VercelResponse } from '@vercel/node';
import { FEEDBACK_GENERATION_PROMPT } from '../src/lib/prompts';

interface FeedbackRequest {
  transcript: string;
  role: string;
  interviewType: string;
}

interface FeedbackResponse {
  score: number;
  strengths: string[];
  improvements: string[];
  learnings: string[];
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { transcript, role, interviewType }: FeedbackRequest = req.body;

    if (!transcript || !role || !interviewType) {
      return res.status(400).json({ 
        error: 'Transcript, role, and interviewType are required' 
      });
    }

    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      console.error('OpenAI API key not configured');
      return res.status(500).json({ error: 'OpenAI API key not configured' });
    }

    const messages = [
      {
        role: 'system' as const,
        content: FEEDBACK_GENERATION_PROMPT,
      },
      {
        role: 'user' as const,
        content: `Please analyze this ${interviewType} interview for a ${role} position:

TRANSCRIPT:
${transcript}

Provide feedback in the exact JSON format specified.`,
      },
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        max_tokens: 500,
        temperature: 0.3, // Lower temperature for more consistent JSON output
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      return res.status(response.status).json({ 
        error: 'OpenAI API error',
        details: errorData 
      });
    }

    const data = await response.json();
    const feedbackText = data.choices[0]?.message?.content || '';
    
    try {
      // Parse the JSON response
      const feedback: FeedbackResponse = JSON.parse(feedbackText.trim());
      
      // Validate the response structure
      if (
        typeof feedback.score !== 'number' ||
        !Array.isArray(feedback.strengths) ||
        !Array.isArray(feedback.improvements) ||
        !Array.isArray(feedback.learnings) ||
        feedback.strengths.length !== 3 ||
        feedback.improvements.length !== 3 ||
        feedback.learnings.length !== 3
      ) {
        throw new Error('Invalid feedback structure');
      }

      return res.status(200).json(feedback);

    } catch (parseError) {
      console.error('Failed to parse feedback JSON:', parseError);
      console.error('Raw response:', feedbackText);
      
      // Return a fallback response
      return res.status(200).json({
        score: 6,
        strengths: [
          "You participated actively in the interview",
          "You showed enthusiasm for the role",
          "You attempted to answer all questions"
        ],
        improvements: [
          "Provide more specific examples in your responses",
          "Use the STAR method to structure your answers",
          "Practice speaking more confidently and clearly"
        ],
        learnings: [
          "Prepare concrete examples before interviews",
          "Research the company and role thoroughly",
          "Practice common interview questions out loud"
        ]
      });
    }

  } catch (error) {
    console.error('Feedback API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
