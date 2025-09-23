import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    // Simple test response for now - will integrate ElevenLabs once this works
    const response = {
      audio: "dGVzdF9hdWRpb19kYXRh", // base64 encoded "test_audio_data"
      format: 'mp3'
    };

    return res.status(200).json(response);

  } catch (error) {
    console.error('TTS API error:', error);
    return res.status(500).json({ error: 'Failed to generate speech' });
  }
}
