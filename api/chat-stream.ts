import { NextApiRequest, NextApiResponse } from 'next';

const openaiApiKey = process.env.openai_api_key;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!openaiApiKey) {
    return res.status(500).json({ error: 'OpenAI API key not configured' });
  }

  try {
    const { partialTranscript, isPartial, role = 'Software Engineer' } = req.body;

    // For partial results, we can pre-process or prepare for the full request
    if (isPartial) {
      // Log partial transcript for analytics/debugging
      console.log('Partial transcript received:', partialTranscript);
      
      // Pre-warm the connection or do preliminary processing
      return res.status(200).json({
        status: 'received',
        message: 'Partial transcript processed',
      });
    }

    // Handle full transcript processing with streaming
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
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
        stream: true, // Enable streaming for low latency
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    // Set up Server-Sent Events for streaming
    res.writeHead(200, {
      'Content-Type': 'text/plain',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Failed to get response stream');
    }

    let fullResponse = '';
    
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              res.write(`data: ${JSON.stringify({ 
                type: 'complete', 
                fullResponse 
              })}\n\n`);
              res.end();
              return;
            }

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              
              if (content) {
                fullResponse += content;
                res.write(`data: ${JSON.stringify({ 
                  type: 'chunk', 
                  content,
                  fullResponse: fullResponse 
                })}\n\n`);
              }
            } catch (parseError) {
              // Skip invalid JSON lines
              continue;
            }
          }
        }
      }
    } catch (streamError) {
      console.error('Streaming error:', streamError);
      res.write(`data: ${JSON.stringify({ 
        type: 'error', 
        message: 'Streaming interrupted' 
      })}\n\n`);
      res.end();
    }

  } catch (error) {
    console.error('Chat stream API error:', error);
    res.status(500).json({ error: 'Failed to process chat stream request' });
  }
}
