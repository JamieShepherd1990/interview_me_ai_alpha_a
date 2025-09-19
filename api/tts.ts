import { NextApiRequest, NextApiResponse } from 'next';

const elevenlabsApiKey = process.env.ELEVENLABS_API_KEY;
if (!elevenlabsApiKey) {
  console.error('ElevenLabs API key not configured');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!elevenlabsApiKey) {
    return res.status(500).json({ error: 'ElevenLabs API key not configured' });
  }

  try {
    const { text, voiceId = 'pNInz6obpgDQGcFmaJgB' } = req.body;

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': elevenlabsApiKey,
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.status}`);
    }

    const audioBuffer = await response.arrayBuffer();
    const audioBase64 = Buffer.from(audioBuffer).toString('base64');

    // For now, return a mock viseme array
    // In a real implementation, you'd process the audio to extract visemes
    const visemes = [
      { timestamp: 0, phoneme: 'sil' },
      { timestamp: 0.5, phoneme: 'ah' },
      { timestamp: 1.0, phoneme: 'eh' },
      { timestamp: 1.5, phoneme: 'oh' },
    ];

    res.status(200).json({
      audioUrl: `data:audio/mpeg;base64,${audioBase64}`,
      visemes,
    });
  } catch (error) {
    console.error('TTS API error:', error);
    res.status(500).json({ error: 'Failed to generate speech' });
  }
}