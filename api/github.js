export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  
  if (!GITHUB_TOKEN) {
    return res.status(500).json({ 
      error: 'GitHub token not configured. Please add GITHUB_TOKEN environment variable in Vercel dashboard.',
      setupInstructions: 'Go to Vercel Dashboard → Project Settings → Environment Variables → Add GITHUB_TOKEN'
    });
  }

  const { method, path, body } = req.body || {};

  try {
    const url = `https://api.github.com${path}`;
    
    const response = await fetch(url, {
      method: method || 'GET',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Prairie-Giraffe-Blog'
      },
      body: body ? JSON.stringify(body) : undefined
    });

    const data = await response.json();
    
    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}