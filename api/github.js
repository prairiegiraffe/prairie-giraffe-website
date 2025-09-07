export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Debug logging
  console.log('Request method:', req.method);
  console.log('Request body:', req.body);
  
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  
  // Better debugging for token
  console.log('Token exists:', !!GITHUB_TOKEN);
  console.log('Token length:', GITHUB_TOKEN ? GITHUB_TOKEN.length : 0);
  console.log('Token starts with ghp_:', GITHUB_TOKEN ? GITHUB_TOKEN.startsWith('ghp_') : false);
  
  if (!GITHUB_TOKEN) {
    console.log('No GitHub token found');
    return res.status(500).json({ 
      error: 'GitHub token not configured. Please add GITHUB_TOKEN environment variable in Vercel dashboard.',
      setupInstructions: 'Go to Vercel Dashboard → Project Settings → Environment Variables → Add GITHUB_TOKEN',
      debug: {
        envVars: Object.keys(process.env).filter(key => key.includes('GITHUB')),
        allEnvKeys: Object.keys(process.env).length
      }
    });
  }

  const { method, path, body } = req.body || {};

  if (!path) {
    return res.status(400).json({ error: 'Path is required', received: req.body });
  }

  try {
    const url = `https://api.github.com${path}`;
    console.log('Making request to:', url);
    console.log('Method:', method);
    
    const response = await fetch(url, {
      method: method || 'GET',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Prairie-Giraffe-Blog'
      },
      body: body ? JSON.stringify(body) : undefined
    });

    console.log('GitHub response status:', response.status);
    
    const data = await response.json();
    
    if (!response.ok) {
      console.log('GitHub error:', data);
      return res.status(response.status).json({
        ...data,
        debug: {
          url,
          method,
          status: response.status,
          tokenLength: GITHUB_TOKEN.length
        }
      });
    }

    console.log('Success:', data.length || Object.keys(data).length, 'items/keys');
    res.status(200).json(data);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      error: error.message,
      stack: error.stack,
      debug: {
        path,
        method,
        hasToken: !!GITHUB_TOKEN
      }
    });
  }
}