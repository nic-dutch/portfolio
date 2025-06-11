// components/search.js - Search and filtering functionality

class SearchComponent {
    constructor() {
        this.searchInput = null;
        this.searchClear = null;
        this.filterTags = null;
        this.currentFilter = 'all';
        this.currentSearch = '';
        this.projects = [];
        this.isInitialized = false;
        this.searchTimeout = null;
    }

    // Initialize the search component
    init() {
        this.searchInput = document.getElementById('projectSearch');
        this.searchClear = document.getElementById('searchClear');
        this.filterTags = document.querySelectorAll('.filter-tag');

        if (!this.searchInput || !this.searchClear) {
            console.warn('Search components not found in DOM');
            return false;
        }

        this.bindEvents();
        this.loadProjects();
        this.isInitialized = true;
        return true;
    }

    // Bind event listeners
    bindEvents() {
        // Search input handling
        this.searchInput.addEventListener('input', (e) => {
            this.handleSearchInput(e.target.value);
        });

        // Clear search button
        this.searchClear.addEventListener('click', () => {
            this.clearSearch();
        });

        // Filter tag handling
        this.filterTags.forEach(tag => {
            tag.addEventListener('click', (e) => {
                this.handleFilterClick(e.target);
            });
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'k') {
                e.preventDefault();
                this.focusSearch();
            }
            if (e.key === 'Escape' && document.activeElement === this.searchInput) {
                this.clearSearch();
            }
        });
    }

    // Handle search input
    handleSearchInput(value) {
        this.currentSearch = value.toLowerCase().trim();
        this.updateClearButton();
        this.debounceSearch();
    }

    // Debounced search to improve performance
    debounceSearch() {
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
            this.filterProjects();
        }, 300);
    }

    // Update clear button visibility
    updateClearButton() {
        this.searchClear.classList.toggle('show', this.currentSearch.length > 0);
    }

    // Clear search
    clearSearch() {
        this.searchInput.value = '';
        this.currentSearch = '';
        this.updateClearButton();
        this.filterProjects();
        this.searchInput.focus();
    }

    // Focus search input
    focusSearch() {
        this.searchInput.focus();
        this.searchInput.select();
    }

    // Handle filter tag click
    handleFilterClick(clickedTag) {
        // Remove active class from all tags
        this.filterTags.forEach(tag => tag.classList.remove('active'));
        
        // Add active class to clicked tag
        clickedTag.classList.add('active');
        
        // Update current filter
        this.currentFilter = clickedTag.dataset.filter;
        
        // Filter projects
        this.filterProjects();
        
        // Analytics tracking (optional)
        this.trackFilterUsage(this.currentFilter);
    }

    // Load projects data
    loadProjects() {
        this.projects = this.getProjectsData();
    }

    // Main filtering function
    filterProjects() {
        const projectCards = document.querySelectorAll('.project-card');
        const filteredProjects = this.getFilteredProjects();
        
        // Show/hide cards based on filter results
        projectCards.forEach((card, index) => {
            const project = this.projects[index];
            const shouldShow = project ? filteredProjects.includes(project) : false;
            this.animateCard(card, shouldShow, index);
        });

        // Update results count
        this.updateResultsCount(filteredProjects.length);
        
        // Show no results message if needed
        this.showNoResultsMessage(filteredProjects.length === 0);
    }

    // Get filtered projects based on current search and filter
    getFilteredProjects() {
        let filtered = [...this.projects];

        // Apply filter
        if (this.currentFilter !== 'all') {
            filtered = filtered.filter(project => 
                project.tags.includes(this.currentFilter) || 
                project.category === this.currentFilter
            );
        }

        // Apply search
        if (this.currentSearch) {
            filtered = filtered.filter(project => {
                const searchableText = `${project.title} ${project.description} ${project.tags.join(' ')}`.toLowerCase();
                return searchableText.includes(this.currentSearch);
            });
        }

        return filtered;
    }

    // Animate card visibility
    animateCard(card, show, delay = 0) {
        if (show) {
            card.style.display = 'block';
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, delay * 50);
        } else {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            setTimeout(() => {
                card.style.display = 'none';
            }, 300);
        }
    }

    // Update results count (if you have a counter element)
    updateResultsCount(count) {
        const counter = document.getElementById('resultsCount');
        if (counter) {
            counter.textContent = `${count} project${count !== 1 ? 's' : ''} found`;
        }
    }

    // Show/hide no results message
    showNoResultsMessage(show) {
        let noResultsMsg = document.getElementById('noResultsMessage');
        const projectsContainer = document.querySelector('#projects .row');
        
        if (show && !noResultsMsg && projectsContainer) {
            noResultsMsg = document.createElement('div');
            noResultsMsg.id = 'noResultsMessage';
            noResultsMsg.className = 'col-12 text-center mt-5';
            noResultsMsg.innerHTML = `
                <div class="no-results">
                    <i class="bi bi-search" style="font-size: 3rem; color: #6c757d; margin-bottom: 1rem;"></i>
                    <h4>No projects found</h4>
                    <p class="text-muted">Try adjusting your search terms or filter selection.</p>
                    <button class="btn btn-outline-secondary btn-sm" onclick="searchComponent.clearAll()">
                        Clear All Filters
                    </button>
                </div>
            `;
            projectsContainer.appendChild(noResultsMsg);
        } else if (!show && noResultsMsg) {
            noResultsMsg.remove();
        }
    }

    // Clear all filters and search
    clearAll() {
        this.currentSearch = '';
        this.currentFilter = 'all';
        this.searchInput.value = '';
        this.updateClearButton();
        
        // Reset filter tags
        this.filterTags.forEach(tag => {
            tag.classList.remove('active');
            if (tag.dataset.filter === 'all') {
                tag.classList.add('active');
            }
        });
        
        this.filterProjects();
    }

    // Track filter usage (for analytics)
    trackFilterUsage(filter) {
        // You can implement analytics tracking here
        console.log(`Filter used: ${filter}`);
    }

    // Get projects data - this should match your actual project structure
    getProjectsData() {
        return [
            {
                id: 'rem-protocol',
                title: 'REM Protocol Development',
                description: 'Collaborative reforestation effectiveness monitoring protocol with standardized field methods and data collection frameworks for natural resource agencies.',
                tags: ['post-fire', 'reforestation', 'protocol', 'field-methods', 'collaboration'],
                category: 'post-fire',
                status: 'ongoing'
            },
            {
                id: 'remote-sensing',
                title: 'Post-Fire Recovery Analysis',
                description: 'Multi-temporal satellite imagery analysis using Google Earth Engine and Python to track vegetation recovery patterns in post-fire landscapes.',
                tags: ['remote-sensing', 'gis', 'google-earth-engine', 'python', 'ndvi', 'satellite'],
                category: 'remote-sensing',
                status: 'complete'
            },
            {
                id: 'gis-database',
                title: 'Forest Monitoring Database',
                description: 'Integrated spatial database system for managing field monitoring data, remote sensing results, and collaborative research outputs across multiple organizations.',
                tags: ['gis', 'database', 'arcgis', 'postgis', 'data-management'],
                category: 'gis',
                status: 'ongoing'
            }
        ];
    }
}

// Create global instance
const searchComponent = new SearchComponent();

// Export for module use (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SearchComponent;
}