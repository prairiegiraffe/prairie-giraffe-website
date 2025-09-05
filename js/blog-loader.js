// Blog Loader - Dynamically loads and displays markdown blog posts
class BlogLoader {
    constructor() {
        this.posts = [];
        this.apiEndpoint = '/api/github';
    }

    // GitHub API helper
    async githubAPI(method, path, body = null) {
        try {
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ method, path, body })
            });
            
            if (response.ok) {
                return response.json();
            } else {
                console.log('Using fallback - Vercel API not available');
                return null; // Will skip markdown posts if API fails
            }
        } catch (error) {
            console.log('API error:', error.message);
            return null;
        }
    }

    // Load posts from GitHub
    async loadPosts() {
        try {
            const data = await this.githubAPI('GET', '/repos/prairiegiraffe/prairie-giraffe-website/contents/blog');
            if (!data) return [];
            
            const markdownFiles = data.filter(file => file.name.endsWith('.md'));
            const posts = [];

            for (const file of markdownFiles) {
                try {
                    const content = await this.githubAPI('GET', `/repos/prairiegiraffe/prairie-giraffe-website/contents/blog/${file.name}`);
                    if (content) {
                        const decoded = atob(content.content);
                        const post = this.parseMarkdown(decoded, file.name);
                        if (post) posts.push(post);
                    }
                } catch (error) {
                    console.log(`Error loading ${file.name}:`, error);
                }
            }

            return posts.sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort by date, newest first
        } catch (error) {
            console.log('Error loading posts:', error);
            return [];
        }
    }

    // Parse markdown with frontmatter
    parseMarkdown(content, filename) {
        const parts = content.split('---');
        if (parts.length < 3) return null;

        const frontmatter = parts[1];
        const body = parts.slice(2).join('---').trim();

        // Extract frontmatter fields
        const titleMatch = frontmatter.match(/title:\s*"([^"]+)"/);
        const dateMatch = frontmatter.match(/date:\s*"([^"]+)"/);
        const authorMatch = frontmatter.match(/author:\s*"([^"]+)"/);
        const categoryMatch = frontmatter.match(/category:\s*"([^"]+)"/);
        const descriptionMatch = frontmatter.match(/description:\s*"([^"]+)"/);

        return {
            title: titleMatch ? titleMatch[1] : filename.replace('.md', ''),
            date: dateMatch ? dateMatch[1] : new Date().toISOString(),
            author: authorMatch ? authorMatch[1] : 'Kellee Carroll',
            category: categoryMatch ? categoryMatch[1] : 'Blog',
            description: descriptionMatch ? descriptionMatch[1] : '',
            content: body,
            filename: filename,
            slug: filename.replace('.md', '')
        };
    }

    // Convert markdown to HTML (basic)
    markdownToHtml(markdown) {
        return markdown
            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
            .replace(/\*(.*)\*/gim, '<em>$1</em>')
            .replace(/!\[([^\]]*)\]\(([^\)]+)\)/gim, '<img alt="$1" src="$2">')
            .replace(/\[([^\]]+)\]\(([^\)]+)\)/gim, '<a href="$2">$1</a>')
            .replace(/\n\n/gim, '</p><p>')
            .replace(/^(.+)$/gim, '<p>$1</p>')
            .replace(/<p><\/p>/gim, '');
    }

    // Format date
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    }

    // Generate blog card HTML
    generateBlogCard(post) {
        const excerpt = post.description || post.content.substring(0, 150) + '...';
        
        return `
            <div class="col-lg-12">
                <a href="#" class="mil-blog-card mil-blog-card-hori mil-more mil-mb-60" onclick="blogLoader.viewPost('${post.slug}'); return false;">
                    <div class="mil-cover-frame mil-up">
                        <div style="width: 100%; height: 200px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; color: white; font-size: 24px; font-weight: bold;">
                            ${post.title.substring(0, 2).toUpperCase()}
                        </div>
                    </div>
                    <div class="mil-post-descr">
                        <div class="mil-labels mil-up mil-mb-30">
                            <div class="mil-label mil-upper mil-accent">${post.category}</div>
                            <div class="mil-label mil-upper">${this.formatDate(post.date)}</div>
                        </div>
                        <h4 class="mil-up mil-mb-30">${post.title}</h4>
                        <p class="mil-post-text mil-up mil-mb-30">${excerpt}</p>
                        <div class="mil-link mil-dark mil-arrow-place mil-up">
                            <span>Read more</span>
                        </div>
                    </div>
                </a>
            </div>
        `;
    }

    // View individual post
    viewPost(slug) {
        const post = this.posts.find(p => p.slug === slug);
        if (!post) return;

        // Create a simple modal or redirect to a post page
        const content = this.markdownToHtml(post.content);
        
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
            background: rgba(0,0,0,0.8); z-index: 9999; overflow: auto;
            display: flex; align-items: center; justify-content: center; padding: 20px;
        `;
        
        modal.innerHTML = `
            <div style="background: white; max-width: 800px; width: 100%; border-radius: 8px; overflow: hidden; max-height: 90vh; overflow-y: auto;">
                <div style="padding: 30px;">
                    <button onclick="this.parentElement.parentElement.parentElement.remove()" 
                            style="float: right; background: none; border: none; font-size: 24px; cursor: pointer;">&times;</button>
                    <div style="margin-bottom: 20px;">
                        <span style="background: #667eea; color: white; padding: 4px 12px; border-radius: 4px; font-size: 12px; text-transform: uppercase;">${post.category}</span>
                        <span style="margin-left: 15px; color: #666;">${this.formatDate(post.date)}</span>
                    </div>
                    <h1 style="margin-bottom: 10px; color: #2c3e50;">${post.title}</h1>
                    <p style="color: #666; margin-bottom: 30px; font-style: italic;">${post.description}</p>
                    <div style="line-height: 1.6; color: #333;">${content}</div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    // Initialize and render posts
    async init() {
        const blogContainer = document.querySelector('.row');
        if (!blogContainer) return;

        // Show loading state
        blogContainer.innerHTML = '<div class="col-12"><p style="text-align: center; padding: 40px;">Loading blog posts...</p></div>';

        // Load posts
        this.posts = await this.loadPosts();

        if (this.posts.length === 0) {
            blogContainer.innerHTML = '<div class="col-12"><p style="text-align: center; padding: 40px;">No blog posts available yet.</p></div>';
            return;
        }

        // Render posts
        blogContainer.innerHTML = this.posts.map(post => this.generateBlogCard(post)).join('');
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    if (document.querySelector('.mil-blog-card')) {
        window.blogLoader = new BlogLoader();
        blogLoader.init();
    }
});