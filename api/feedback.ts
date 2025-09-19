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
    const { transcript, role } = req.body;

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
            content: `You are an AI interview coach analyzing a mock interview session. Provide detailed feedback in JSON format only.

Role: ${role}
Transcript: ${transcript}

Respond with a JSON object matching this exact structure:
{
  "score": number (0-10),
  "strengths": ["strength1", "strength2", "strength3"],
  "improvements": ["improvement1", "improvement2", "improvement3"],
  "learnings": ["learning1", "learning2", "learning3"]
}

Focus on:
- Communication clarity
- STAR method usage
- Professional demeanor
- Role-specific knowledge
- Areas for improvement

Do not include any text outside the JSON object.`
          }
        ],
        max_tokens: 500,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const feedbackText = data.choices[0]?.message?.content || '{}';

    try {
      const feedback = JSON.parse(feedbackText);
      res.status(200).json(feedback);
    } catch (parseError) {
      // Fallback if JSON parsing fails
      res.status(200).json({
        score: 7,
        strengths: ["Good communication", "Professional demeanor", "Clear responses"],
        improvements: ["Use more specific examples", "Practice STAR method", "Ask clarifying questions"],
        learnings: ["Interview preparation", "Communication skills", "Professional presentation"]
      });
    }
  } catch (error) {
    console.error('Feedback API error:', error);
    res.status(500).json({ error: 'Failed to generate feedback' });
  }
}