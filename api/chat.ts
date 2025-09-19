import { NextApiRequest, NextApiResponse } from 'next';

const openaiApiKey = process.env.OPENAI_API_KEY;
if (!openaiApiKey) {
  console.error('OpenAI API key not configured');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!openaiApiKey) {
    return res.status(500).json({ error: 'OpenAI API key not configured' });
  }

  try {
    const { message, transcript, role } = req.body;

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
Previous conversation: ${transcript}`
          },
          {
            role: 'user',
            content: message
          }
        ],
        max_tokens: 150,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content || 'I apologize, but I didn\'t understand that. Could you please repeat?';

    res.status(200).json({
      response: aiResponse,
      isComplete: true,
    });
  } catch (error) {
    console.error('Chat API error:', error);
    res.status(500).json({ error: 'Failed to process chat request' });
  }
}