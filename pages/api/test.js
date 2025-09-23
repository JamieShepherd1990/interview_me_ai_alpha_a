export default async function handler(req, res) {
  return res.status(200).json({ 
    status: 'working',
    timestamp: new Date().toISOString(),
    message: 'API test endpoint is working'
  });
}
