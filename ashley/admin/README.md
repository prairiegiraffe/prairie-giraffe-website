# Prairie Giraffe Blog CMS

## Getting Started with Decap CMS

### For Local Development:

1. **Start the local server:**
   ```bash
   npm run cms
   ```

2. **Start your site:**
   ```bash
   npm run dev
   ```

3. **Access the CMS:**
   - Open http://localhost:3000/admin in your browser
   - The CMS will use local files (no authentication needed)

### For Production (Vercel):

1. **Enable Git Gateway in Netlify Identity:**
   - Sign up for a free Netlify account
   - Go to your site settings → Identity
   - Enable Git Gateway

2. **Update admin/config.yml:**
   - Change `local_backend: true` to `local_backend: false`
   - The CMS will use Git Gateway for authentication

### Creating Blog Posts:

1. Go to the CMS at `/admin`
2. Click "Blog Posts" in the sidebar
3. Click "New Blog Posts" 
4. Fill out the form:
   - **Title:** Your blog post title
   - **Date:** Publication date
   - **Category:** Choose from AI Automation, Website Development, SEO & Marketing, Business Tips
   - **Featured Image:** Upload an image
   - **Excerpt:** Short description for the blog listing
   - **Body:** Write your post content (supports markdown)
   - **Featured Post:** Check this to show on homepage

5. Click "Publish" to save

### How It Works:

- **Content Storage:** All blog posts are saved as markdown files in `ashley/blog-posts/`
- **Images:** Uploaded images are saved in `ashley/img/blog/`
- **Build Process:** Run `npm run build` to generate HTML pages from markdown
- **Git Integration:** All changes are committed to your Git repository

### Blog URLs:

- Blog listing: `/blog.html`
- Individual posts: `/blog/your-post-slug.html`

### Tips:

- **Categories** map to the categories in your blog navigation
- **Featured posts** appear in the highlighted section of your blog
- **Excerpts** show up in blog listings and meta descriptions
- **Tags** help with SEO and organization
- Use **markdown syntax** in the body for formatting (headings, links, lists, etc.)