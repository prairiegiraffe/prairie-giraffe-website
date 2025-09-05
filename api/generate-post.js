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

  // Smart content processing - handles both HTML and Markdown
  let htmlContent = post.content;
  
  // If it looks like Markdown (no HTML tags), convert it
  if (!htmlContent.includes('<') || htmlContent.includes('##') || htmlContent.includes('**')) {
    htmlContent = htmlContent
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/gim, '<em>$1</em>')
      .replace(/!\[([^\]]*)\]\(([^\)]+)\)/gim, '<img alt="$1" src="$2" style="max-width: 100%; height: auto; margin: 20px 0;">')
      .replace(/\[([^\]]+)\]\(([^\)]+)\)/gim, '<a href="$2">$1</a>')
      .split('\n\n')
      .filter(p => p.trim())
      .map(p => p.trim().startsWith('<') ? p : `<p>${p}</p>`)
      .join('\n');
  }

  return \`<!DOCTYPE html>
<html lang="zxx">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    
    <!-- bootstrap grid css -->
    <link rel="stylesheet" href="../css/plugins/bootstrap-grid.css">
    <!-- font awesome css -->
    <link rel="stylesheet" href="../css/plugins/font-awesome.min.css">
    <!-- swiper css -->
    <link rel="stylesheet" href="../css/plugins/swiper.min.css">
    <!-- fancybox css -->
    <link rel="stylesheet" href="../css/plugins/fancybox.min.css">
    <!-- ashley scss -->
    <link rel="stylesheet" href="../css/style.css">
    
    <!-- page name -->
    <title>\${post.title} - Prairie Giraffe</title>
    <meta name="description" content="\${post.description}">
    <meta name="author" content="\${post.author}">
    
    <!-- Open Graph -->
    <meta property="og:title" content="\${post.title}">
    <meta property="og:description" content="\${post.description}">
    <meta property="og:type" content="article">
    <meta property="article:author" content="\${post.author}">
    <meta property="article:published_time" content="\${post.date}">
</head>

<body>
    <!-- wrapper -->
    <div class="mil-wrapper" id="top">

        <!-- cursor -->
        <div class="mil-ball">
            <span class="mil-icon-1">
                <svg viewBox="0 0 128 128">
                    <path d="M106.1,41.9c-1.2-1.2-3.1-1.2-4.2,0c-1.2,1.2-1.2,3.1,0,4.2L116.8,61H11.2l14.9-14.9c1.2-1.2,1.2-3.1,0-4.2	c-1.2-1.2-3.1-1.2-4.2,0l-20,20c-1.2,1.2-1.2,3.1,0,4.2l20,20c0.6,0.6,1.4,0.9,2.1,0.9s1.5-0.3,2.1-0.9c1.2-1.2,1.2-3.1,0-4.2	L11.2,67h105.5l-14.9,14.9c1.2,1.2,1.2,3.1,0,4.2c0.6,0.6,1.4,0.9,2.1,0.9s1.5-0.3,2.1-0.9l20-20c1.2-1.2,1.2-3.1,0-4.2L106.1,41.9	z" />
                </svg>
            </span>
            <div class="mil-more-text">More</div>
            <div class="mil-choose-text">Choose</div>
        </div>
        <!-- cursor end -->

        <!-- scrollbar progress -->
        <div class="mil-progress-track">
            <div class="mil-progress"></div>
        </div>
        <!-- scrollbar progress end -->

        <!-- menu -->
        <div class="mil-menu-frame">
            <!-- frame clone -->
            <div class="mil-frame-top">
                <a href="../index.html" class="mil-logo">PG.</a>
                <div class="mil-menu-btn">
                    <span></span>
                </div>
            </div>
            <!-- frame clone end -->
            <div class="container">
                <div class="mil-menu-content">
                    <div class="row">
                        <div class="col-xl-5">
                            <nav class="mil-main-menu" id="swupMenu">
                                <ul>
                                    <li class="mil-has-children">
                                        <a href="#.">Homepage</a>
                                        <ul>
                                            <li><a href="../index.html">Home</a></li>
                                        </ul>
                                    </li>
                                    <li class="mil-has-children">
                                        <a href="#.">Services</a>
                                        <ul>
                                            <li><a href="../services.html">Services List</a></li>
                                            <li><a href="../ai-automation.html">AI Automation</a></li>
                                            <li><a href="../website-development.html">Website Development</a></li>
                                            <li><a href="../seo-services.html">SEO Services</a></li>
                                        </ul>
                                    </li>
                                    <li class="mil-has-children mil-active">
                                        <a href="#.">Blog</a>
                                        <ul>
                                            <li><a href="../blog/index.html">Blog</a></li>
                                        </ul>
                                    </li>
                                    <li class="mil-has-children">
                                        <a href="#.">Other pages</a>
                                        <ul>
                                            <li><a href="../team.html">Team</a></li>
                                            <li><a href="../contact.html">Contact</a></li>
                                        </ul>
                                    </li>
                                </ul>
                            </nav>
                        </div>
                        <div class="col-xl-7">
                            <div class="mil-menu-right-frame">
                                <div class="mil-animation-in">
                                    <div class="mil-animation-frame">
                                        <div class="mil-animation mil-position-1 mil-scale" data-value-1="2" data-value-2="2"></div>
                                        <div class="mil-animation mil-position-2 mil-scale" data-value-1="2" data-value-2="2"></div>
                                        <div class="mil-animation mil-position-3 mil-scale" data-value-1="-2" data-value-2="-2"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!-- menu end -->

        <!-- content -->
        <div class="mil-content">
            <div id="swupMain" class="mil-main-transition">

                <!-- banner -->
                <div class="mil-inner-banner mil-p-0-120">
                    <div class="mil-banner-content mil-center mil-up">
                        <div class="mil-animation-frame">
                            <div class="mil-animation mil-position-1 mil-scale" data-value-1="7" data-value-2="1.4"></div>
                            <div class="mil-animation mil-position-2 mil-scale" data-value-1="4" data-value-2="1"></div>
                            <div class="mil-animation mil-position-3 mil-scale" data-value-1="-1" data-value-2="-2"></div>
                        </div>
                        <div class="container">
                            <ul class="mil-breadcrumbs mil-mb-60">
                                <li><a href="../index.html">Homepage</a></li>
                                <li><a href="../blog/">Blog</a></li>
                                <li><a href="#.">\${post.title}</a></li>
                            </ul>
                            <h1 class="mil-mb-60">\${post.title}</h1>
                            <div class="mil-blog-info">
                                <span class="mil-accent">\${post.category}</span>
                                <span>/</span>
                                <span>\${formattedDate}</span>
                                <span>/</span>
                                <span>By \${post.author}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- banner end -->

                <!-- publication -->
                <div class="mil-p-120-60">
                    <div class="container mil-p-120-60">
                        <div class="row justify-content-center">
                            <div class="col-lg-8">
                                <div class="mil-publication">
                                    <div class="mil-publication-content">
                                        \${htmlContent}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- publication end -->

                <!-- call to action -->
                <div class="mil-cta mil-up">
                    <div class="container mil-p-120-90">
                        <div class="row">
                            <div class="col-lg-10">
                                <div class="mil-center">
                                    <span class="mil-suptitle mil-suptitle-right mil-suptitle-dark mil-up">Want help with your business?</span>
                                    <h2 class="mil-up mil-mb-30">\${post.cta_title}</h2>
                                    <p class="mil-up mil-mb-40">\${post.cta_description}</p>
                                    <div class="mil-up">
                                        <a href="../contact.html" class="mil-button mil-arrow-place">
                                            <span>Get Started Today</span>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- call to action end -->

            </div>
        </div>
        <!-- content end -->

        <!-- footer -->
        <footer class="mil-relative">
            <div class="container mil-p-120-60">
                <div class="row justify-content-between">
                    <div class="col-md-4 col-lg-4 mil-mb-60">
                        <div class="mil-muted mil-logo mil-up mil-mb-30">Prairie Giraffe</div>
                        <p class="mil-light-soft mil-up mil-mb-30">We are a team of creatives who help businesses grow through digital marketing and web development.</p>
                    </div>
                    <div class="col-md-7 col-lg-6">
                        <div class="row justify-content-end">
                            <div class="col-md-6 col-lg-7">
                                <nav class="mil-footer-menu mil-mb-60">
                                    <ul>
                                        <li class="mil-up mil-active">
                                            <a href="../blog/">Blog</a>
                                        </li>
                                        <li class="mil-up">
                                            <a href="../services.html">Services</a>
                                        </li>
                                        <li class="mil-up">
                                            <a href="../contact.html">Contact</a>
                                        </li>
                                        <li class="mil-up">
                                            <a href="../team.html">Team</a>
                                        </li>
                                    </ul>
                                </nav>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="container-fluid">
                <div class="row">
                    <div class="col-lg-12">
                        <div class="mil-center">
                            <p class="mil-light-soft mil-up">© Copyright 2025 • Prairie Giraffe • Everyone Is Welcome</p>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
        <!-- footer end -->

    </div>
    <!-- wrapper end -->

    <!-- jquery js -->
    <script src="../js/plugins/jquery.min.js"></script>
    <!-- swiper js -->
    <script src="../js/plugins/swiper.min.js"></script>
    <!-- itsulu js -->
    <script src="../js/plugins/itsulu.min.js"></script>
    <!-- fancybox js -->
    <script src="../js/plugins/fancybox.min.js"></script>
    <!-- gsap js -->
    <script src="../js/plugins/gsap.min.js"></script>
    <!-- scroll smoother -->
    <script src="../js/plugins/smooth-scroll.js"></script>
    <!-- scroll trigger js -->
    <script src="../js/plugins/ScrollTrigger.min.js"></script>
    <!-- scroll to js -->
    <script src="../js/plugins/ScrollTo.min.js"></script>
    <!-- ashley js -->
    <script src="../js/blog.js"></script>

</body>
</html>\`;
}