// Simple test endpoint
export default function handler(req, res) {
  res.status(200).json({ 
    status: 'working',
    timestamp: new Date().toISOString(),
    message: 'API test endpoint is working'
  });
}
