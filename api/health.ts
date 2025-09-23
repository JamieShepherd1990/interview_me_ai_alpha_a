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
    debug: {
      envKeys: Object.keys(process.env).filter(key => key.includes('OPENAI') || key.includes('ELEVEN')),
      openai_upper: !!process.env.OPENAI_API_KEY,
      openai_lower: !!process.env.openai_api_key,
      elevenlabs_upper: !!process.env.ELEVENLABS_API_KEY,
      elevenlabs_lower: !!process.env.elevenlabs_api_key,
    },
    version: '1.0.2' // Force new deployment
  });
}