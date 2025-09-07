const fs = require('fs-extra');
const path = require('path');
const { glob } = require('glob');
const matter = require('gray-matter');

class BlogBuilder {
    constructor() {
        this.srcDir = 'ashley';
        this.distDir = 'dist';
        this.componentsDir = path.join(this.srcDir, 'components');
        this.blogPostsDir = path.join(this.srcDir, 'blog-posts');
        this.components = {};
        this.blogPosts = [];
        this.marked = null;
    }

    async init() {
        console.log('📝 Building Blog with Markdown Posts...\n');
        
        // Import marked dynamically
        const { marked } = await import('marked');
        this.marked = marked;
        
        // Load components first
        await this.loadComponents();
        
        // Process markdown blog posts
        await this.processBlogPosts();
        
        // Update blog listing page
        await this.updateBlogListing();
        
        console.log('✅ Blog build completed successfully!');
    }

    async loadComponents() {
        console.log('📦 Loading components...');
        
        try {
            const componentFiles = await glob(`${this.componentsDir}/*.html`);
            
            for (const filePath of componentFiles) {
                const componentName = path.basename(filePath, '.html');
                const content = await fs.readFile(filePath, 'utf8');
                this.components[componentName] = content;
                console.log(`   ✓ Loaded ${componentName}.html`);
            }
        } catch (error) {
            console.log('   ⚠️  No components directory found, skipping...');
        }
    }

    async processBlogPosts() {
        console.log('\n📰 Processing markdown blog posts...');
        
        try {
            const markdownFiles = await glob(`${this.blogPostsDir}/*.md`);
            
            for (const filePath of markdownFiles) {
                const fileName = path.basename(filePath, '.md');
                console.log(`   Processing ${fileName}...`);
                
                const fileContent = await fs.readFile(filePath, 'utf8');
                const { data: frontMatter, content: markdownContent } = matter(fileContent);
                
                // Convert markdown to HTML
                const htmlContent = this.marked(markdownContent);
                
                // Create blog post object
                const blogPost = {
                    slug: fileName,
                    ...frontMatter,
                    content: htmlContent,
                    url: `blog/${fileName}.html`
                };
                
                this.blogPosts.push(blogPost);
                
                // Generate individual blog post HTML
                await this.generateBlogPostHTML(blogPost);
                
                console.log(`   ✓ Built ${fileName}.html`);
            }
            
            // Sort posts by date (newest first)
            this.blogPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
            
        } catch (error) {
            console.log('   ⚠️  No blog posts found, skipping...');
        }
    }

    async generateBlogPostHTML(post) {
        // Create a blog post template based on publication.html
        const template = `<!DOCTYPE html>
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
    
    <title>${post.title} - Prairie Giraffe</title>
    <meta name="description" content="${post.excerpt}">
</head>

<body>
    <div class="mil-wrapper" id="top">
        <!-- cursor -->
        <div class="mil-ball">
            <span class="mil-icon-1">
                <svg viewBox="0 0 128 128">
                    <path d="M106.1,41.9c-1.2-1.2-3.1-1.2-4.2,0c-1.2,1.2-1.2,3.1,0,4.2L116.8,61H11.2l14.9-14.9c1.2-1.2,1.2-3.1,0-4.2	c-1.2-1.2-3.1-1.2-4.2,0l-20,20c-1.2,1.2-1.2,3.1,0,4.2l20,20c0.6,0.6,1.4,0.9,2.1,0.9s1.5-0.3,2.1-0.9c1.2-1.2,1.2-3.1,0-4.2	L11.2,67h105.5l-14.9,14.9c-1.2,1.2-1.2,3.1,0,4.2c0.6,0.6,1.4,0.9,2.1,0.9s1.5-0.3,2.1-0.9l20-20c1.2-1.2,1.2-3.1,0-4.2L106.1,41.9	z" />
                </svg>
            </span>
            <div class="mil-more-text">More</div>
            <div class="mil-choose-text">Сhoose</div>
        </div>
        <!-- cursor end -->

        <!-- scrollbar progress -->
        <div class="mil-progress-track">
            <div class="mil-progress"></div>
        </div>
        <!-- scrollbar progress end -->

        <!-- menu -->
        ${this.replaceComponentPlaceholders('<!-- HEADER_PLACEHOLDER -->', 'blog.html')}
        <!-- menu end -->

        <!-- curtain -->
        <div class="mil-curtain"></div>
        <!-- curtain end -->

        <!-- frame -->
        <div class="mil-frame">
            <div class="mil-frame-top">
                <a href="../home-1.html" class="mil-logo">PG.</a>
                <div class="mil-menu-btn">
                    <span></span>
                </div>
            </div>
            <div class="mil-frame-bottom">
                <div class="mil-current-page"></div>
                <div class="mil-back-to-top">
                    <a href="#top" class="mil-link mil-dark mil-arrow-place">
                        <span>Back to top</span>
                    </a>
                </div>
            </div>
        </div>
        <!-- frame end -->

        <!-- content -->
        <div class="mil-content">
            <div id="swupMain" class="mil-main-transition">

                <!-- banner -->
                <div class="mil-inner-banner">
                    <div class="mil-banner-content mil-up">
                        <div class="mil-animation-frame">
                            <div class="mil-animation mil-position-4 mil-dark mil-scale" data-value-1="6" data-value-2="1.4"></div>
                        </div>
                        <div class="container">
                            <ul class="mil-breadcrumbs mil-mb-60">
                                <li><a href="../home-1.html">Homepage</a></li>
                                <li><a href="../blog.html">Blog</a></li>
                                <li><a href="#.">${post.title}</a></li>
                            </ul>
                            <div class="mil-labels mil-up mil-mb-30">
                                <div class="mil-label mil-upper mil-accent">${post.category.toUpperCase()}</div>
                                <div class="mil-label mil-upper">${new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</div>
                            </div>
                            <h1 class="mil-mb-60">${post.title}</h1>
                        </div>
                    </div>
                </div>
                <!-- banner end -->

                <!-- publication -->
                <section>
                    <div class="container mil-p-120-120">
                        <div class="row justify-content-center">
                            <div class="col-lg-8">
                                
                                <div class="mil-publication">
                                    <div class="mil-cover mil-up mil-mb-60">
                                        <img src="../${post.featured_image}" alt="${post.title}" style="border-radius: 8px;">
                                    </div>
                                    
                                    <div class="mil-text mil-up mil-mb-60">
                                        ${post.content}
                                    </div>

                                    <div class="mil-divider mil-up mil-mb-60"></div>
                                    
                                    <div class="row align-items-center">
                                        <div class="col-lg-6">
                                            <div class="mil-up">
                                                <a href="../blog.html" class="mil-link mil-dark mil-arrow-place">
                                                    <span>Back to Blog</span>
                                                </a>
                                            </div>
                                        </div>
                                        <div class="col-lg-6">
                                            <div class="mil-adaptive-right mil-up">
                                                <a href="../contact.html" class="mil-button mil-arrow-place">
                                                    <span>Let's Connect</span>
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </section>
                <!-- publication end -->

                <!-- footer -->
                ${this.replaceComponentPlaceholders('<!-- FOOTER_PLACEHOLDER -->', 'blog.html')}
                <!-- footer end -->

            </div>
        </div>
        <!-- content -->
    </div>
    <!-- wrapper end -->

    <!-- jQuery js -->
    <script src="../js/plugins/jquery.min.js"></script>
    <!-- swup js -->
    <script src="../js/plugins/swup.min.js"></script>
    <!-- swiper js -->
    <script src="../js/plugins/swiper.min.js"></script>
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
    <script src="../js/main.js"></script>

</body>

</html>`;

        // Ensure blog directory exists in dist
        await fs.ensureDir(path.join(this.distDir, 'blog'));
        
        // Write the blog post HTML
        const outputPath = path.join(this.distDir, 'blog', `${post.slug}.html`);
        await fs.writeFile(outputPath, template);
    }

    async updateBlogListing() {
        console.log('\n🔄 Updating blog listing page...');
        
        // Read the current blog.html
        const blogHtmlPath = path.join(this.distDir, 'blog.html');
        
        if (await fs.pathExists(blogHtmlPath)) {
            let blogContent = await fs.readFile(blogHtmlPath, 'utf8');
            
            // Generate HTML for featured posts and regular posts
            const featuredPosts = this.blogPosts.filter(post => post.featured).slice(0, 2);
            const regularPosts = this.blogPosts.slice(0, 6);
            
            // Generate featured posts HTML
            const featuredPostsHtml = featuredPosts.map((post, index) => `
                                <a href="blog/${post.slug}.html" class="mil-blog-card mil-mb-60">
                                    <div class="mil-cover-frame mil-up">
                                        <img src="${post.featured_image}" alt="${post.title}">
                                    </div>
                                    <div class="mil-post-descr">
                                        <div class="mil-labels mil-up mil-mb-30">
                                            <div class="mil-label mil-upper mil-accent">${post.category.toUpperCase()}</div>
                                            <div class="mil-label mil-upper">${new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</div>
                                        </div>
                                        <h4 class="mil-up mil-mb-30">${post.title}</h4>
                                        <p class="mil-post-text mil-up mil-mb-30">${post.excerpt}</p>
                                        <div class="mil-link mil-dark mil-arrow-place mil-up">
                                            <span>Read more</span>
                                        </div>
                                    </div>
                                </a>`).join('\n\n                            ');

            // Generate regular posts HTML
            const regularPostsHtml = regularPosts.map(post => `
                                <a href="blog/${post.slug}.html" class="mil-blog-card mil-blog-card-hori mil-more mil-mb-60">
                                    <div class="mil-cover-frame mil-up">
                                        <img src="${post.featured_image}" alt="${post.title}">
                                    </div>
                                    <div class="mil-post-descr">
                                        <div class="mil-labels mil-up mil-mb-30">
                                            <div class="mil-label mil-upper mil-accent">${post.category.toUpperCase()}</div>
                                            <div class="mil-label mil-upper">${new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</div>
                                        </div>
                                        <h4 class="mil-up mil-mb-30">${post.title}</h4>
                                        <p class="mil-post-text mil-up mil-mb-30">${post.excerpt}</p>
                                        <div class="mil-link mil-dark mil-arrow-place mil-up">
                                            <span>Read more</span>
                                        </div>
                                    </div>
                                </a>`).join('\n\n                            ');

            // Replace the content in the featured section
            if (featuredPosts.length > 0) {
                blogContent = blogContent.replace(
                    /(<div class="row">\s*<div class="col-lg-6">)([\s\S]*?)(<\/div>\s*<\/div>\s*<\/div>\s*<\/section>)/,
                    `$1\n\n                            ${featuredPostsHtml}\n\n                        </div>\n                        <div class="col-lg-6">\n\n                            ${featuredPosts[1] ? '' : ''}\n\n                        $3`
                );
            }

            await fs.writeFile(blogHtmlPath, blogContent);
            console.log('   ✓ Updated blog listing with markdown posts');
        }
    }

    replaceComponentPlaceholders(content, fileName) {
        // Replace header placeholder
        if (this.components.header) {
            let headerContent = this.components.header;
            
            // Set active navigation for blog pages
            if (fileName.includes('blog')) {
                headerContent = headerContent.replace(
                    /<li class="mil-active">\s*<a href="home-1\.html">Home<\/a>\s*<\/li>/,
                    '<li><a href="../home-1.html">Home</a></li>'
                ).replace(
                    /<li class="mil-has-children">\s*<a href="#\.">Resources<\/a>/,
                    '<li class="mil-has-children mil-active"><a href="#.">Resources</a>'
                );
                
                // Update links to go up one directory
                headerContent = headerContent.replace(/href="([^"]+)"/g, (match, url) => {
                    if (!url.startsWith('#') && !url.startsWith('http') && !url.startsWith('../')) {
                        return `href="../${url}"`;
                    }
                    return match;
                });
            }
            
            content = content.replace(
                /\s*<!-- HEADER_PLACEHOLDER -->\s*/g,
                `\n        ${headerContent}\n`
            );
        }
        
        // Replace footer placeholder
        if (this.components.footer) {
            let footerContent = this.components.footer;
            
            // Update footer links to go up one directory for blog posts
            if (fileName.includes('blog')) {
                footerContent = footerContent.replace(/href="([^"]+)"/g, (match, url) => {
                    if (!url.startsWith('#') && !url.startsWith('http') && !url.startsWith('../')) {
                        return `href="../${url}"`;
                    }
                    return match;
                });
            }
            
            content = content.replace(
                /\s*<!-- FOOTER_PLACEHOLDER -->\s*/g,
                `\n                ${footerContent}\n`
            );
        }
        
        return content;
    }
}

// Run the blog builder
const blogBuilder = new BlogBuilder();
blogBuilder.init().catch(console.error);