export default async function handler(req, res) {
  const API_URL = 'http://168.138.158.94:3000/graphql';
  
  // Forward headers
  const headers = {
    'Content-Type': 'application/json',
    'apollo-require-preflight': 'true',
  };
  
  if (req.headers.authorization) {
    headers.authorization = req.headers.authorization;
  }

  try {
    const response = await fetch(API_URL, {
      method: req.method,
      headers,
      body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined,
    });

    const data = await response.text();
    res.status(response.status).send(data);
  } catch (error) {
    res.status(500).json({ error: 'Proxy error' });
  }
}