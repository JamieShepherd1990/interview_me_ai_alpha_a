import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.openai_api_key,
});

export async function POST(request: NextRequest) {
  try {
    const { transcript, role } = await request.json();

    const systemPrompt = `Analyze this interview transcript and provide feedback. Respond ONLY with a valid JSON object matching this exact schema:

{
  "score": number (0-10),
  "strengths": [string, string, string],
  "improvements": [string, string, string], 
  "learnings": [string, string, string]
}

Do not include any explanatory text or markdown formatting.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Interview transcript for ${role} position:\n\n${transcript}` }
      ],
      max_tokens: 500,
      temperature: 0.3,
    });

    const content = response.choices[0].message.content;
    
    // Parse and validate the JSON response
    try {
      const feedback = JSON.parse(content);
      
      // Basic validation
      if (typeof feedback.score !== 'number' || feedback.score < 0 || feedback.score > 10) {
        throw new Error('Invalid score');
      }
      
      if (!Array.isArray(feedback.strengths) || feedback.strengths.length !== 3) {
        throw new Error('Invalid strengths array');
      }
      
      if (!Array.isArray(feedback.improvements) || feedback.improvements.length !== 3) {
        throw new Error('Invalid improvements array');
      }
      
      if (!Array.isArray(feedback.learnings) || feedback.learnings.length !== 3) {
        throw new Error('Invalid learnings array');
      }

      return NextResponse.json(feedback);
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      return NextResponse.json(
        { error: 'Invalid response format from AI' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('OpenAI API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate feedback' },
      { status: 500 }
    );
  }
}
