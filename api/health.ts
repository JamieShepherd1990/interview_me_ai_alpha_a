import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      openai: process.env.OPENAI_API_KEY ? 'configured' : 'missing',
      elevenlabs: process.env.ELEVENLABS_API_KEY ? 'configured' : 'missing',
    },
    version: '1.0.1' // Force new deployment
  });
}