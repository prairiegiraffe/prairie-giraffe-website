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
        this.initializeInteractivity();
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

    initializeInteractivity() {
        // Wait for jQuery to be available
        if (typeof $ !== 'undefined') {
            this.setupMenuToggle();
            this.setupCursor();
            this.setupScrollProgress();
            this.setupBackToTop();
        } else {
            // Retry after jQuery loads
            setTimeout(() => this.initializeInteractivity(), 100);
        }
    }

    setupMenuToggle() {
        // Menu button click handler
        $('.mil-menu-btn').off('click').on('click', function () {
            $('.mil-menu-btn').toggleClass('mil-active');
            $('.mil-menu-frame').toggleClass('mil-active');
            $('body').toggleClass('mil-no-scroll');
        });

        // Close menu when clicking outside or on menu items
        $(document).off('click.menu').on('click.menu', function(e) {
            if (!$(e.target).closest('.mil-menu-frame, .mil-menu-btn').length) {
                $('.mil-menu-btn').removeClass('mil-active');
                $('.mil-menu-frame').removeClass('mil-active');
                $('body').removeClass('mil-no-scroll');
            }
        });

        // Close menu on menu item click
        $('.mil-main-menu a').off('click.menu').on('click.menu', function() {
            $('.mil-menu-btn').removeClass('mil-active');
            $('.mil-menu-frame').removeClass('mil-active');
            $('body').removeClass('mil-no-scroll');
        });
    }

    setupCursor() {
        // Custom cursor functionality
        if ($('.mil-ball').length) {
            const cursor = $('.mil-ball');
            let mouseX = 0, mouseY = 0;
            let ballX = 0, ballY = 0;
            const speed = 0.1;

            $(document).mousemove(function(e) {
                mouseX = e.clientX;
                mouseY = e.clientY;
            });

            function updateCursor() {
                ballX += (mouseX - ballX) * speed;
                ballY += (mouseY - ballY) * speed;
                cursor.css('transform', `translate(${ballX}px, ${ballY}px)`);
                requestAnimationFrame(updateCursor);
            }
            updateCursor();

            // Cursor hover effects
            $('a, button, .mil-menu-btn').hover(
                function() { cursor.addClass('mil-scale'); },
                function() { cursor.removeClass('mil-scale'); }
            );
        }
    }

    setupScrollProgress() {
        // Scroll progress bar
        if ($('.mil-progress').length) {
            $(window).scroll(function() {
                const scrollTop = $(window).scrollTop();
                const docHeight = $(document).height();
                const winHeight = $(window).height();
                const scrollPercent = scrollTop / (docHeight - winHeight);
                const scrollPercentRounded = Math.round(scrollPercent * 100);
                $('.mil-progress').css('width', scrollPercentRounded + '%');
            });
        }
    }

    setupBackToTop() {
        // Back to top functionality
        $('.mil-back-to-top a').off('click').on('click', function(e) {
            e.preventDefault();
            $('html, body').animate({ scrollTop: 0 }, 800);
        });
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