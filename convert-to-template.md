# Converting Pages to Template System

## What You Have Now:
✅ **Working Template System** with:
- `components/header.html` - Shared header/navigation
- `components/footer.html` - Shared footer  
- `js/template-loader.js` - Loads components with full functionality
- `template-example.html` - Working demonstration

## How to Convert Any Page:

### 1. **Replace Header Section**
Find this section in any page (after preloader if it exists):
```html
<!-- scrollbar progress -->
<div class="mil-progress-track">...
<!-- ALL THE WAY DOWN TO -->
<!-- frame end -->
```

Replace it with:
```html
<!-- SHARED HEADER COMPONENT -->
<div id="header-container">
    <!-- Header will be loaded here by template-loader.js -->
</div>
<!-- SHARED HEADER END -->
```

### 2. **Replace Footer Section**
Find this section:
```html
<!-- footer -->
<footer class="mil-dark-bg">...
<!-- ALL THE WAY DOWN TO -->
<!-- hidden elements end -->
```

Replace it with:
```html
<!-- SHARED FOOTER COMPONENT -->
<div id="footer-container">
    <!-- Footer will be loaded here by template-loader.js -->
</div>
<!-- SHARED FOOTER END -->
```

### 3. **Update Scripts**
Change the script loading order to:
```html
<!-- jQuery js (load first) -->
<script src="js/plugins/jquery.min.js"></script>
<!-- Template loader script (load after jQuery, before main.js) -->
<script src="js/template-loader.js"></script>

<!-- Other plugins -->
<script src="js/plugins/swiper.min.js"></script>
<!-- ... other scripts ... -->
<!-- ashley js (load last) -->
<script src="js/main.js"></script>
```

## Benefits After Conversion:

### ✅ **Global Header/Footer Management**
- Change menu items: Edit 1 file (`components/header.html`)
- Update contact info: Edit 1 file (`components/footer.html`)  
- Add new navigation: Edit 1 file, applies to entire site

### ✅ **Automatic Features**
- Active navigation highlighting
- Correct "current page" vertical text
- Path adjustments for blog subfolder
- All interactive elements work (menu, cursor, scroll)

## Test First:
Visit `template-example.html` on your deployed site to see the template system working perfectly with:
- Working menu toggle
- Custom cursor following mouse
- Back to top functionality
- Vertical side text showing page name
- All animations and interactions

## Conversion Priority:
1. **Most Important Pages First**: index.html, contact.html
2. **Service Pages**: ai-automation.html, website-development.html, etc.
3. **Blog System**: Update API to generate template-based posts
4. **Less Critical Pages**: team.html, etc.

## Blog Post Integration:
Your CMS can generate posts using the template system too. The `blog/post.html` template already handles dynamic loading of markdown content.

---

**The template system is production-ready!** You can start using it immediately for new pages, then convert existing pages when you have time. Each converted page instantly gets global header/footer management.