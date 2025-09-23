// @ts-ignore
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    res.status(200).json({ 
      message: 'Simple test API is working!',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Simple test API error:', error);
    res.status(500).json({ error: 'Failed to process simple test request' });
  }
}
