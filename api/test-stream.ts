import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Set up Server-Sent Events for streaming
    res.writeHead(200, {
      'Content-Type': 'text/plain',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });

    // Send test streaming response
    res.write(`data: ${JSON.stringify({ 
      type: 'chunk', 
      content: 'Hello from streaming API!',
      fullResponse: 'Hello from streaming API!'
    })}\n\n`);

    res.write(`data: ${JSON.stringify({ 
      type: 'complete', 
      fullResponse: 'Hello from streaming API!'
    })}\n\n`);

    res.end();

  } catch (error) {
    console.error('Test stream API error:', error);
    res.status(500).json({ error: 'Failed to process test stream request' });
  }
}
