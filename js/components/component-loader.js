// js/components/component-loader.js
// Enhanced component loading system with nested includes support

class ComponentLoader {
    constructor() {
        this.components = new Map();
        this.siteConfig = {};
        this.isLoaded = false;
    }

    async init() {
        console.log('🚀 Loading components...');
        
        try {
            // Load site configuration first
            await this.loadSiteConfig();
            
            // Load all components
            await this.loadAllComponents();
            
            // Process the current page
            await this.processPage();
            
            this.isLoaded = true;
            console.log('✅ All components loaded successfully!');
            
            // Dispatch custom event for when components are ready
            document.dispatchEvent(new CustomEvent('componentsLoaded'));
            
        } catch (error) {
            console.error('❌ Error loading components:', error);
        }
    }

    async loadSiteConfig() {
        try {
            const response = await fetch('src/data/site-config.json');
            this.siteConfig = await response.json();
            console.log('📋 Site configuration loaded');
        } catch (error) {
            console.warn('⚠️ Could not load site config, using defaults');
            this.siteConfig = {
                siteName: "Your Portfolio",
                author: "Your Name",
                description: "Geospatial Ecologist Portfolio"
            };
        }
    }

    async loadAllComponents() {
        const componentNames = [
            // Shared components (used by multiple pages)
            'shared/head',
            'shared/navigation', 
            'shared/social-bar',
            'shared/scripts',
            
            // Index page components
            'index/hero-section',
            'index/research-section',
            'index/projects-section', 
            'index/experience-section',
            'index/skills-section',
            'index/publications-section',
            'index/contact-section',
            
            // Projects page components
            'projects/projects-hero',
            'projects/projects-categories',
            
            // Category cards
            'projects/categories/programming-card',
            'projects/categories/remote-sensing-card',
            'projects/categories/database-management-card',
            'projects/categories/web-design-card'
        ];

        const loadPromises = componentNames.map(name => this.loadComponent(name));
        await Promise.all(loadPromises);
    }

    async loadComponent(name) {
        try {
            const response = await fetch(`src/components/${name}.html`);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            const html = await response.text();
            this.components.set(name, html);
            console.log(`  ✓ Loaded ${name}`);
        } catch (error) {
            console.warn(`  ⚠️ Could not load component '${name}':`, error.message);
            this.components.set(name, `<!-- Component ${name} not found -->`);
        }
    }

    async processPage() {
        // Process includes: {{> component-name}} (with multiple levels)
        await this.processIncludesRecursively();
        
        // Process variables: {{variableName}}
        this.processVariables();
    }

    async processIncludesRecursively(maxDepth = 5) {
        let processedAny = false;
        let depth = 0;
        
        do {
            processedAny = false;
            depth++;
            
            if (depth > maxDepth) {
                console.warn('⚠️ Maximum include depth reached, stopping to prevent infinite loops');
                break;
            }
            
            console.log(`🔄 Processing includes level ${depth}...`);
            
            // Updated regex to handle nested paths like shared/navigation
            const includeRegex = /\{\{\>\s*([a-zA-Z0-9-_\/]+)\s*\}\}/g;
            
            // Find all elements that might contain includes
            const walker = document.createTreeWalker(
                document.documentElement,
                NodeFilter.SHOW_TEXT,
                null,
                false
            );

            const textNodes = [];
            let node;
            while (node = walker.nextNode()) {
                if (includeRegex.test(node.textContent)) {
                    textNodes.push(node);
                }
            }

            // Process each text node
            textNodes.forEach(textNode => {
                let content = textNode.textContent;
                let originalContent = content;
                
                content = content.replace(includeRegex, (match, componentName) => {
                    const component = this.components.get(componentName);
                    if (component) {
                        processedAny = true;
                        console.log(`    ✓ Processed include: ${componentName}`);
                        return component;
                    } else {
                        console.warn(`    ⚠️ Component not found: ${componentName}`);
                        return `<!-- Component ${componentName} not found -->`;
                    }
                });
                
                // Only update if content changed
                if (content !== originalContent) {
                    // Replace the text node with the processed HTML
                    const wrapper = document.createElement('div');
                    wrapper.innerHTML = content;
                    
                    // Insert all child nodes before the text node
                    while (wrapper.firstChild) {
                        textNode.parentNode.insertBefore(wrapper.firstChild, textNode);
                    }
                    
                    // Remove the original text node
                    textNode.remove();
                }
            });
            
            console.log(`    Level ${depth}: ${processedAny ? 'Found includes to process' : 'No more includes found'}`);
            
        } while (processedAny && depth < maxDepth);
        
        console.log(`✅ Include processing complete after ${depth} levels`);
    }

    processVariables() {
        const variableRegex = /\{\{([a-zA-Z0-9-_.]+)\}\}/g;
        
        // Find all text nodes that might contain variables
        const walker = document.createTreeWalker(
            document.documentElement,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );

        const textNodes = [];
        let node;
        while (node = walker.nextNode()) {
            if (variableRegex.test(node.textContent)) {
                textNodes.push(node);
            }
        }

        // Process variables in text nodes
        textNodes.forEach(textNode => {
            textNode.textContent = textNode.textContent.replace(variableRegex, (match, variableName) => {
                const value = this.getNestedValue(this.siteConfig, variableName);
                return value !== undefined ? value : match;
            });
        });

        // Also process variables in attributes
        this.processAttributeVariables();
    }

    processAttributeVariables() {
        const variableRegex = /\{\{([a-zA-Z0-9-_.]+)\}\}/g;
        const elementsWithVariables = document.querySelectorAll('*');
        
        elementsWithVariables.forEach(element => {
            // Check common attributes
            ['href', 'src', 'alt', 'title', 'content'].forEach(attr => {
                const value = element.getAttribute(attr);
                if (value && variableRegex.test(value)) {
                    const newValue = value.replace(variableRegex, (match, variableName) => {
                        const configValue = this.getNestedValue(this.siteConfig, variableName);
                        return configValue !== undefined ? configValue : match;
                    });
                    element.setAttribute(attr, newValue);
                }
            });
        });
    }

    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => {
            return current && current[key] !== undefined ? current[key] : undefined;
        }, obj);
    }

    // Utility method to manually load a component into a specific element
    async loadComponentInto(elementId, componentName, variables = {}) {
        const element = document.getElementById(elementId);
        if (!element) {
            console.warn(`Element with id '${elementId}' not found`);
            return;
        }

        let html = this.components.get(componentName);
        if (!html) {
            console.warn(`Component '${componentName}' not found`);
            return;
        }

        // Replace variables in the component
        const allVariables = { ...this.siteConfig, ...variables };
        const variableRegex = /\{\{([a-zA-Z0-9-_.]+)\}\}/g;
        html = html.replace(variableRegex, (match, variableName) => {
            const value = this.getNestedValue(allVariables, variableName);
            return value !== undefined ? value : match;
        });

        element.innerHTML = html;
    }
}

// Global instance
window.componentLoader = new ComponentLoader();

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.componentLoader.init();
});

// Helper function for manual component loading
window.loadComponent = (elementId, componentName, variables) => {
    return window.componentLoader.loadComponentInto(elementId, componentName, variables);
};