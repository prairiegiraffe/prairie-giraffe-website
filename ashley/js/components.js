// Component loader for Ashley template
class ComponentLoader {
    
    // Load a component from a file and inject it into a target element
    static async loadComponent(componentPath, targetSelector) {
        try {
            const response = await fetch(componentPath);
            if (!response.ok) {
                throw new Error(`Failed to load component: ${componentPath}`);
            }
            
            const html = await response.text();
            const targetElement = document.querySelector(targetSelector);
            
            if (!targetElement) {
                console.error(`Target element not found: ${targetSelector}`);
                return;
            }
            
            targetElement.innerHTML = html;
            
            // Trigger custom event to notify that component has been loaded
            const event = new CustomEvent('componentLoaded', {
                detail: { componentPath, targetSelector }
            });
            document.dispatchEvent(event);
            
        } catch (error) {
            console.error('Error loading component:', error);
        }
    }
    
    // Load header component
    static loadHeader() {
        return this.loadComponent('components/header.html', '#header-placeholder');
    }
    
    // Load footer component
    static loadFooter() {
        return this.loadComponent('components/footer.html', '#footer-placeholder');
    }
    
    // Initialize all components
    static async init() {
        await Promise.all([
            this.loadHeader(),
            this.loadFooter()
        ]);
        
        // Dispatch event when all components are loaded
        const event = new CustomEvent('allComponentsLoaded');
        document.dispatchEvent(event);
    }
}

// Auto-initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    ComponentLoader.init();
});

// Export for use in other scripts if needed
window.ComponentLoader = ComponentLoader;