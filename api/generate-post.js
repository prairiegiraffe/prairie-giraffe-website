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

    // Generate HTML page
    const html = generatePostHTML(post);

    // Save the HTML file
    const htmlFileResponse = await fetch(`https://api.github.com/repos/prairiegiraffe/prairie-giraffe-website/contents/blog/blog-post-${slug}.html`, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `Generate HTML page for blog post: ${post.title}`,
        content: Buffer.from(html).toString('base64'),
        branch: 'main'
      })
    });

    if (htmlFileResponse.ok) {
      res.status(200).json({ success: true, url: `blog-post-${slug}.html` });
    } else {
      const error = await htmlFileResponse.json();
      throw new Error(error.message || 'Failed to create HTML file');
    }

  } catch (error) {
    console.error('Generate post error:', error);
    res.status(500).json({ error: error.message });
  }
}

function generatePostHTML(post) {
  const formattedDate = new Date(post.date).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  // Convert markdown to HTML (basic)
  const htmlContent = post.content
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^### (.*$)/gim, '<h3>$3</h3>')
    .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*)\*/gim, '<em>$1</em>')
    .replace(/!\[([^\]]*)\]\(([^\)]+)\)/gim, '<img alt="$1" src="$2">')
    .replace(/\[([^\]]+)\]\(([^\)]+)\)/gim, '<a href="$2">$1</a>')
    .split('\n\n')
    .map(p => p.trim() ? `<p>${p}</p>` : '')
    .join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    
    <!-- SEO Meta Tags -->
    <title>${post.title} - Prairie Giraffe</title>
    <meta name="description" content="${post.description}">
    <meta name="author" content="${post.author}">
    <meta name="keywords" content="${post.category}, ${post.title}">
    
    <!-- Open Graph -->
    <meta property="og:title" content="${post.title}">
    <meta property="og:description" content="${post.description}">
    <meta property="og:type" content="article">
    <meta property="article:author" content="${post.author}">
    <meta property="article:published_time" content="${post.date}">
    
    <!-- Styles -->
    <link rel="stylesheet" href="../css/plugins/bootstrap-grid.css">
    <link rel="stylesheet" href="../css/plugins/font-awesome.min.css">
    <link rel="stylesheet" href="../css/plugins/swiper.min.css">
    <link rel="stylesheet" href="../css/plugins/fancybox.min.css">
    <link rel="stylesheet" href="../css/style.css">
</head>
<body>
    <div class="mil-wrapper" id="top">
        <!-- Navigation (simplified) -->
        <div style="padding: 20px; text-align: center; background: #f8f9fa; margin-bottom: 40px;">
            <a href="../" style="text-decoration: none; color: #333; font-weight: bold; font-size: 24px;">Prairie Giraffe</a>
            <div style="margin-top: 10px;">
                <a href="../blog/" style="margin: 0 15px; color: #667eea; text-decoration: none;">← Back to Blog</a>
            </div>
        </div>

        <!-- Article -->
        <article style="max-width: 800px; margin: 0 auto; padding: 0 20px;">
            <!-- Article Header -->
            <header style="margin-bottom: 40px; text-align: center;">
                <div style="margin-bottom: 20px;">
                    <span style="background: #667eea; color: white; padding: 6px 16px; border-radius: 20px; font-size: 14px; text-transform: uppercase; font-weight: bold;">${post.category}</span>
                    <span style="margin-left: 20px; color: #666;">${formattedDate}</span>
                </div>
                <h1 style="font-size: 2.5rem; color: #2c3e50; margin: 20px 0; line-height: 1.2;">${post.title}</h1>
                <p style="font-size: 1.2rem; color: #666; font-style: italic; margin: 20px 0;">${post.description}</p>
                <div style="color: #888; font-size: 16px;">By ${post.author}</div>
            </header>

            <!-- Article Content -->
            <div style="line-height: 1.8; color: #333; font-size: 18px; margin-bottom: 60px;">
                ${htmlContent}
            </div>

            <!-- Call to Action -->
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; border-radius: 8px; text-align: center; margin: 60px 0;">
                <h3 style="margin-bottom: 15px; color: white;">${post.cta_title}</h3>
                <p style="margin-bottom: 25px; opacity: 0.9;">${post.cta_description}</p>
                <a href="../contact.html" style="background: white; color: #667eea; padding: 12px 30px; border-radius: 25px; text-decoration: none; font-weight: bold; display: inline-block;">Get Started Today</a>
            </div>

            <!-- Back to Blog -->
            <div style="text-align: center; margin: 40px 0; padding: 20px 0; border-top: 1px solid #eee;">
                <a href="../blog/" style="color: #667eea; text-decoration: none; font-weight: bold;">← Back to All Posts</a>
            </div>
        </article>

        <!-- Footer (simplified) -->
        <footer style="background: #2c3e50; color: white; padding: 40px 20px; text-align: center; margin-top: 60px;">
            <div style="max-width: 800px; margin: 0 auto;">
                <div style="font-size: 24px; font-weight: bold; margin-bottom: 20px;">Prairie Giraffe</div>
                <p style="margin-bottom: 20px; opacity: 0.8;">Digital Marketing & Web Development</p>
                <div style="margin-bottom: 30px;">
                    <a href="../services.html" style="color: #fff; margin: 0 15px; text-decoration: none;">Services</a>
                    <a href="../contact.html" style="color: #fff; margin: 0 15px; text-decoration: none;">Contact</a>
                    <a href="../blog/" style="color: #fff; margin: 0 15px; text-decoration: none;">Blog</a>
                </div>
                <div style="border-top: 1px solid #34495e; padding-top: 20px; opacity: 0.6;">
                    <p>© 2025 Prairie Giraffe • Everyone Is Welcome</p>
                </div>
            </div>
        </footer>
    </div>
</body>
</html>`;
}