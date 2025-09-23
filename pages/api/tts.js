export default async function handler(req, res) {
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
    return res.status(200).json({
      audio: "dGVzdF9hdWRpb19kYXRh", // base64 encoded "test_audio_data"
      format: 'mp3'
    });

  } catch (error) {
    console.error('TTS API error:', error);
    return res.status(500).json({ error: 'Failed to generate speech' });
  }
}
