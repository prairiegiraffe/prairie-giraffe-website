const fs = require('fs-extra');
const path = require('path');
const { glob } = require('glob');

class ComponentBuilder {
    constructor() {
        this.srcDir = 'ashley';
        this.distDir = 'dist';
        this.componentsDir = path.join(this.srcDir, 'components');
        this.components = {};
    }

    async init() {
        console.log('🚀 Building Ashley Template with Components...\n');
        
        // Ensure dist directory exists
        await fs.ensureDir(this.distDir);
        
        // Load all components
        await this.loadComponents();
        
        // Process all HTML files
        await this.processHtmlFiles();
        
        // Copy all other assets
        await this.copyAssets();
        
        console.log('✅ Build completed successfully!');
        console.log(`📦 Output: ${this.distDir}/`);
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

    async processHtmlFiles() {
        console.log('\n🔧 Processing HTML files...');
        
        const htmlFiles = await glob(`${this.srcDir}/*.html`);
        
        for (const filePath of htmlFiles) {
            const fileName = path.basename(filePath);
            console.log(`   Processing ${fileName}...`);
            
            let content = await fs.readFile(filePath, 'utf8');
            
            // Replace component placeholders
            content = this.replaceComponentPlaceholders(content, fileName);
            
            // Remove component loader script reference
            content = content.replace(
                /\s*<!-- components js -->\s*\n\s*<script src="js\/components\.js"><\/script>\s*\n/g,
                '\n'
            );
            
            // Write processed file to dist
            const outputPath = path.join(this.distDir, fileName);
            await fs.writeFile(outputPath, content);
            console.log(`   ✓ Built ${fileName}`);
        }
    }

    replaceComponentPlaceholders(content, fileName) {
        // Replace header placeholder
        if (this.components.header) {
            let headerContent = this.components.header;
            
            // Set active navigation based on current page
            if (fileName.includes('ai-automation')) {
                headerContent = headerContent.replace(
                    /<li class="mil-active">\s*<a href="index\.html">Home<\/a>\s*<\/li>/,
                    '<li><a href="index.html">Home</a></li>'
                ).replace(
                    /<li>\s*<a href="\/services">Services<\/a>\s*<\/li>/,
                    '<li class="mil-active"><a href="/services">AI Automation</a></li>'
                );
            } else if (fileName.includes('website-development')) {
                headerContent = headerContent.replace(
                    /<li class="mil-active">\s*<a href="index\.html">Home<\/a>\s*<\/li>/,
                    '<li><a href="index.html">Home</a></li>'
                ).replace(
                    /<li>\s*<a href="\/services">Services<\/a>\s*<\/li>/,
                    '<li class="mil-active"><a href="/services">Website Development</a></li>'
                );
            } else if (fileName.includes('seo-services')) {
                headerContent = headerContent.replace(
                    /<li class="mil-active">\s*<a href="index\.html">Home<\/a>\s*<\/li>/,
                    '<li><a href="index.html">Home</a></li>'
                ).replace(
                    /<li>\s*<a href="\/services">Services<\/a>\s*<\/li>/,
                    '<li class="mil-active"><a href="/services">SEO Services</a></li>'
                );
            } else if (fileName.includes('services')) {
                headerContent = headerContent.replace(
                    /<li class="mil-active">\s*<a href="index\.html">Home<\/a>\s*<\/li>/,
                    '<li><a href="index.html">Home</a></li>'
                ).replace(
                    /<li>\s*<a href="\/services">Services<\/a>\s*<\/li>/,
                    '<li class="mil-active"><a href="/services">Services</a></li>'
                );
            } else if (fileName.includes('team') || fileName.includes('about')) {
                headerContent = headerContent.replace(
                    /<li class="mil-active">\s*<a href="index\.html">Home<\/a>\s*<\/li>/,
                    '<li><a href="index.html">Home</a></li>'
                ).replace(
                    /<li>\s*<a href="\/about">About<\/a>\s*<\/li>/,
                    '<li class="mil-active"><a href="/about">About</a></li>'
                );
            } else if (fileName.includes('contact')) {
                headerContent = headerContent.replace(
                    /<li class="mil-active">\s*<a href="index\.html">Home<\/a>\s*<\/li>/,
                    '<li><a href="index.html">Home</a></li>'
                ).replace(
                    /<li>\s*<a href="\/contact">Let's Connect<\/a>\s*<\/li>/,
                    '<li class="mil-active"><a href="/contact">Let\'s Connect</a></li>'
                );
            } else if (fileName.includes('blog')) {
                headerContent = headerContent.replace(
                    /<li class="mil-active">\s*<a href="index\.html">Home<\/a>\s*<\/li>/,
                    '<li><a href="index.html">Home</a></li>'
                ).replace(
                    /<li class="mil-has-children">\s*<a href="#\.">Resources<\/a>/,
                    '<li class="mil-has-children mil-active"><a href="#.">Resources</a>'
                );
            }
            
            content = content.replace(
                /\s*<!-- header placeholder -->\s*\n\s*<div id="header-placeholder"><\/div>\s*\n\s*<!-- header placeholder end -->\s*/g,
                `\n        ${headerContent}\n`
            );
            
            // Also handle HEADER_PLACEHOLDER format
            content = content.replace(
                /\s*<!-- HEADER_PLACEHOLDER -->\s*/g,
                `\n        ${headerContent}\n`
            );
        }
        
        // Replace footer placeholder
        if (this.components.footer) {
            content = content.replace(
                /\s*<!-- footer placeholder -->\s*\n\s*<div id="footer-placeholder"><\/div>\s*\n\s*<!-- footer placeholder end -->\s*/g,
                `\n                ${this.components.footer}\n`
            );
            
            // Also handle FOOTER_PLACEHOLDER format
            content = content.replace(
                /\s*<!-- FOOTER_PLACEHOLDER -->\s*/g,
                `\n                ${this.components.footer}\n`
            );
        }
        
        return content;
    }

    async copyAssets() {
        console.log('\n📁 Copying assets...');
        
        const assetDirs = ['css', 'js', 'img', 'fonts'];
        
        for (const dir of assetDirs) {
            const srcPath = path.join(this.srcDir, dir);
            const destPath = path.join(this.distDir, dir);
            
            if (await fs.pathExists(srcPath)) {
                await fs.copy(srcPath, destPath);
                console.log(`   ✓ Copied ${dir}/`);
            }
        }
        
        // Copy individual files that might be in the root
        const rootFiles = await glob(`${this.srcDir}/*.{ico,png,jpg,jpeg,gif,svg,txt,xml}`);
        for (const filePath of rootFiles) {
            const fileName = path.basename(filePath);
            await fs.copy(filePath, path.join(this.distDir, fileName));
            console.log(`   ✓ Copied ${fileName}`);
        }
    }
}

// Run the build
const builder = new ComponentBuilder();
builder.init().catch(console.error);