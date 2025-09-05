export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  
  if (!GITHUB_TOKEN) {
    return res.status(500).json({ 
      error: 'GitHub token not configured'
    });
  }

  const { slug } = req.query;

  if (!slug) {
    return res.status(400).json({ error: 'Slug is required' });
  }

  try {
    // Get the markdown file
    const fileResponse = await fetch(`https://api.github.com/repos/prairiegiraffe/prairie-giraffe-website/contents/blog/${slug}.md`, {
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'User-Agent': 'Prairie-Giraffe-Blog'
      }
    });

    if (!fileResponse.ok) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const fileData = await fileResponse.json();
    const content = Buffer.from(fileData.content, 'base64').toString('utf-8');
    
    // Parse frontmatter
    const parts = content.split('---');
    if (parts.length < 3) {
      return res.status(400).json({ error: 'Invalid frontmatter format' });
    }

    const frontmatter = parts[1];
    const body = parts.slice(2).join('---').trim();

    // Extract frontmatter fields
    const titleMatch = frontmatter.match(/title:\s*"([^"]+)"/);
    const dateMatch = frontmatter.match(/date:\s*"([^"]+)"/);
    const authorMatch = frontmatter.match(/author:\s*"([^"]+)"/);
    const categoryMatch = frontmatter.match(/category:\s*"([^"]+)"/);
    const descriptionMatch = frontmatter.match(/description:\s*"([^"]+)"/);
    const ctaTitleMatch = frontmatter.match(/cta_title:\s*"([^"]+)"/);
    const ctaDescriptionMatch = frontmatter.match(/cta_description:\s*"([^"]+)"/);

    const post = {
      title: titleMatch ? titleMatch[1] : slug.replace(/-/g, ' '),
      date: dateMatch ? dateMatch[1] : new Date().toISOString(),
      author: authorMatch ? authorMatch[1] : 'Kellee Carroll',
      category: categoryMatch ? categoryMatch[1] : 'Blog',
      description: descriptionMatch ? descriptionMatch[1] : '',
      content: body,
      slug,
      cta_title: ctaTitleMatch ? ctaTitleMatch[1] : 'Ready to Transform Your Digital Presence?',
      cta_description: ctaDescriptionMatch ? ctaDescriptionMatch[1] : 'Let Prairie Giraffe help you implement these strategies for your business growth.'
    };

    // With template system, we just need the markdown file
    // The blog/post.html template will handle display dynamically
    
    // Return success - the markdown file already exists and can be loaded by template
    res.status(200).json({ 
      success: true, 
      url: `post.html?post=${slug}`,
      message: 'Post ready for template system display'
    });

  } catch (error) {
    console.error('Generate post error:', error);
    res.status(500).json({ error: error.message });
  }
}
