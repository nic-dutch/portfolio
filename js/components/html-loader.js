class HTMLComponentLoader {
    static async loadComponent(elementId, componentPath) {
        try {
            const response = await fetch(componentPath);
            const html = await response.text();
            document.getElementById(elementId).innerHTML = html;
        } catch (error) {
            console.error(`Error loading component ${componentPath}:`, error);
        }
    }
    
    static async loadMultipleComponents(components) {
        const promises = components.map(({ elementId, componentPath }) => 
            this.loadComponent(elementId, componentPath)
        );
        await Promise.all(promises);
    }
}