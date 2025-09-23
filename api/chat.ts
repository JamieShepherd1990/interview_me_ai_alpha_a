import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.openai_api_key,
});

export async function POST(request: NextRequest) {
  try {
    const { messages, role, interviewType } = await request.json();

    // System prompt based on role and interview type
    const systemPrompt = `You are InterviewCoach AI. Your persona is a friendly, supportive, and professional hiring manager. Your audience is university students preparing for their first job.

Your instructions are:
1. Keep your responses concise, typically 1-2 sentences.
2. Begin the interview and ask relevant questions based on the user's chosen role: ${role || 'General'}.
3. Use light, natural fillers ("I see," "That makes sense," "Could you elaborate on that?") to seem more human.
4. If the user's response is vague, probe for more detail using the STAR (Situation, Task, Action, Result) method.
5. Never break character or reveal that you are an AI.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages
      ],
      max_tokens: 150,
      temperature: 0.7,
    });

    return NextResponse.json({
      content: response.choices[0].message.content,
      usage: response.usage
    });

  } catch (error) {
    console.error('OpenAI API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
}
