import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.openai_api_key,
});

export async function POST(request: NextRequest) {
  if (!process.env.openai_api_key) {
    return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 });
  }

  try {
    const { partialTranscript, isPartial, role = 'Software Engineer' } = await request.json();

    // For partial results, we can pre-process or prepare for the full request
    if (isPartial) {
      // Log partial transcript for analytics/debugging
      console.log('Partial transcript received:', partialTranscript);
      
      // Pre-warm the connection or do preliminary processing
      return NextResponse.json({
        status: 'received',
        message: 'Partial transcript processed',
      });
    }

    // Handle full transcript processing with streaming
    const stream = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are InterviewCoach AI. Your persona is a friendly, supportive, and professional hiring manager. Your audience is university students preparing for their first job.

Your instructions are:
1. Keep your responses concise, typically 1-2 sentences.
2. Begin the interview and ask relevant questions based on the user's chosen role.
3. Use light, natural fillers ("I see," "That makes sense," "Could you elaborate on that?") to seem more human.
4. If the user's response is vague, probe for more detail using the STAR (Situation, Task, Action, Result) method.
5. Never break character or reveal that you are an AI.

Current role: ${role}
User response: ${partialTranscript}`
        }
      ],
      max_tokens: 150,
      temperature: 0.7,
      stream: true,
    });

    // Set up Server-Sent Events for streaming
    const encoder = new TextEncoder();
    const streamResponse = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
              const data = JSON.stringify({ 
                type: 'chunk', 
                content,
                fullResponse: content 
              });
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            }
          }
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'complete' })}\n\n`));
          controller.close();
        } catch (error) {
          console.error('Streaming error:', error);
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', message: 'Streaming interrupted' })}\n\n`));
          controller.close();
        }
      }
    });

    return new Response(streamResponse, {
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Chat stream API error:', error);
    return NextResponse.json({ error: 'Failed to process chat stream request' }, { status: 500 });
  }
}
