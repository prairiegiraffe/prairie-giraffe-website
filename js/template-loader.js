/**
 * Prairie Giraffe Template Component Loader
 * Loads shared header and footer components and adjusts paths based on page location
 */

class TemplateLoader {
    constructor() {
        this.isInSubfolder = window.location.pathname.includes('/blog/');
        this.basePath = this.isInSubfolder ? '../' : '';
    }

    async init() {
        await this.loadComponents();
        this.adjustPaths();
        this.setActiveNavigation();
        this.setCurrentPage();
    }

    async loadComponents() {
        try {
            // Load header
            const headerResponse = await fetch(`${this.basePath}components/header.html`);
            if (headerResponse.ok) {
                const headerHTML = await headerResponse.text();
                const headerContainer = document.getElementById('header-container');
                if (headerContainer) {
                    headerContainer.innerHTML = headerHTML;
                }
            }

            // Load footer
            const footerResponse = await fetch(`${this.basePath}components/footer.html`);
            if (footerResponse.ok) {
                const footerHTML = await footerResponse.text();
                const footerContainer = document.getElementById('footer-container');
                if (footerContainer) {
                    footerContainer.innerHTML = footerHTML;
                }
            }
        } catch (error) {
            console.error('Error loading template components:', error);
        }
    }

    adjustPaths() {
        if (!this.isInSubfolder) return;

        // Adjust all relative links in header and footer for blog pages
        const elements = document.querySelectorAll('#header-container a, #footer-container a');
        elements.forEach(link => {
            const href = link.getAttribute('href');
            if (href && !href.startsWith('http') && !href.startsWith('#') && !href.startsWith('../')) {
                // Don't adjust if already adjusted
                if (!href.startsWith('../')) {
                    link.setAttribute('href', '../' + href);
                }
            }
        });

        // Adjust logo links specifically
        const logoLinks = document.querySelectorAll('#header-container .mil-logo');
        logoLinks.forEach(logo => {
            logo.setAttribute('href', '../index.html');
        });
    }

    setActiveNavigation() {
        const currentPath = window.location.pathname;
        
        // Remove active classes first
        document.querySelectorAll('#header-container .mil-active, #footer-container .mil-active').forEach(el => {
            el.classList.remove('mil-active');
        });

        // Determine which navigation item should be active
        let activeNav = '';
        
        if (currentPath.includes('/blog/') || currentPath.includes('blog.html')) {
            activeNav = 'blog';
        } else if (currentPath.includes('services.html') || 
                   currentPath.includes('ai-automation.html') ||
                   currentPath.includes('website-development.html') ||
                   currentPath.includes('seo-services.html') ||
                   currentPath.includes('gillette-services.html')) {
            activeNav = 'services';
        } else if (currentPath.includes('team.html')) {
            activeNav = 'other';
        } else if (currentPath.includes('contact.html')) {
            activeNav = 'other';
        } else if (currentPath.includes('index.html') || currentPath === '/') {
            activeNav = 'home';
        }

        // Set active navigation in header
        if (activeNav) {
            const headerNav = document.querySelector(`#header-container #nav-${activeNav}`);
            if (headerNav) {
                headerNav.classList.add('mil-active');
            }
        }

        // Set active navigation in footer
        const footerMappings = {
            'home': 'footer-nav-home',
            'services': 'footer-nav-services', 
            'other': currentPath.includes('team.html') ? 'footer-nav-about' : 'footer-nav-contact',
            'blog': 'footer-nav-blog'
        };

        if (activeNav && footerMappings[activeNav]) {
            const footerNav = document.querySelector(`#footer-container #${footerMappings[activeNav]}`);
            if (footerNav) {
                footerNav.classList.add('mil-active');
            }
        }
    }

    setCurrentPage() {
        const currentPageElement = document.querySelector('#header-container #current-page');
        if (!currentPageElement) return;

        const currentPath = window.location.pathname;
        let pageName = 'Home';

        if (currentPath.includes('/blog/')) {
            pageName = 'Blog';
        } else if (currentPath.includes('services.html')) {
            pageName = 'Services';
        } else if (currentPath.includes('ai-automation.html')) {
            pageName = 'AI Automation';
        } else if (currentPath.includes('website-development.html')) {
            pageName = 'Website Development';
        } else if (currentPath.includes('seo-services.html')) {
            pageName = 'SEO Services';
        } else if (currentPath.includes('gillette-services.html')) {
            pageName = 'Gillette Local';
        } else if (currentPath.includes('team.html')) {
            pageName = 'Team';
        } else if (currentPath.includes('contact.html')) {
            pageName = 'Contact';
        }

        currentPageElement.textContent = pageName;
    }
}

// Initialize template loader when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    const templateLoader = new TemplateLoader();
    await templateLoader.init();
});

// Export for use in other scripts if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TemplateLoader;
}