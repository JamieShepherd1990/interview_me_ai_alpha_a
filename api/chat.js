import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages, role } = req.body;
    
    // Simple test response for now - will integrate OpenAI once this works
    const response = {
      message: `Hello! I'm your interview coach for the ${role || 'Software Engineer'} role. Tell me about your experience with programming languages.`,
      usage: { total_tokens: 50 }
    };

    return res.status(200).json(response);

  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ error: 'Failed to generate response' });
  }
}
