// Simple serverless function for TTS
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    // For now, return a simple test response
    // TODO: Integrate with ElevenLabs API
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
