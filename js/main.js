// main.js - Main JavaScript entry point

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initSidebar();
    initSearch();
    initNavigation();
    initAnimations();
    
    console.log('Portfolio application initialized successfully');
});

// Initialize sidebar functionality
function initSidebar() {
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebarOverlay = document.getElementById('sidebarOverlay');

    if (!sidebar || !sidebarToggle || !sidebarOverlay) return;

    function toggleSidebar() {
        sidebar.classList.toggle('show');
        sidebarOverlay.classList.toggle('show');
    }

    sidebarToggle.addEventListener('click', toggleSidebar);
    sidebarOverlay.addEventListener('click', toggleSidebar);

    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', function(e) {
        if (window.innerWidth <= 768) {
            if (!sidebar.contains(e.target) && 
                !sidebarToggle.contains(e.target) && 
                sidebar.classList.contains('show')) {
                toggleSidebar();
            }
        }
    });
}

// Initialize navigation functionality
function initNavigation() {
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Close sidebar on mobile after clicking link
                if (window.innerWidth <= 768) {
                    const sidebar = document.getElementById('sidebar');
                    const sidebarOverlay = document.getElementById('sidebarOverlay');
                    sidebar.classList.remove('show');
                    sidebarOverlay.classList.remove('show');
                }
            }
        });
    });

    // Active navigation highlighting
    window.addEventListener('scroll', function() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.sidebar .nav-link');
        
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.clientHeight;
            if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').substring(1) === current) {
                link.classList.add('active');
            }
        });
    });
}

// Initialize search functionality
function initSearch() {
    const projectSearch = document.getElementById('projectSearch');
    const searchClear = document.getElementById('searchClear');
    const filterTags = document.querySelectorAll('.filter-tag');
    
    if (!projectSearch || !searchClear) return;

    let currentFilter = 'all';
    let currentSearch = '';

    // Search input handling
    projectSearch.addEventListener('input', function(e) {
        currentSearch = e.target.value.toLowerCase();
        searchClear.classList.toggle('show', currentSearch.length > 0);
        filterProjects(currentSearch, currentFilter);
    });

    // Clear search
    searchClear.addEventListener('click', function() {
        projectSearch.value = '';
        currentSearch = '';
        searchClear.classList.remove('show');
        filterProjects('', currentFilter);
    });

    // Filter tag handling
    filterTags.forEach(tag => {
        tag.addEventListener('click', function() {
            // Remove active class from all tags
            filterTags.forEach(t => t.classList.remove('active'));
            // Add active class to clicked tag
            this.classList.add('active');
            
            currentFilter = this.dataset.filter;
            filterProjects(currentSearch, currentFilter);
        });
    });
}

// Filter projects based on search and filter criteria
function filterProjects(searchTerm, filter) {
    // Get project data
    const projects = getProjectsData();
    const projectCards = document.querySelectorAll('.project-card');
    
    projectCards.forEach((card, index) => {
        const project = projects[index] || projects[0]; // fallback
        let show = true;

        // Filter by tag
        if (filter !== 'all') {
            show = project.tags.includes(filter);
        }

        // Filter by search term
        if (show && searchTerm) {
            const searchableText = `${project.title} ${project.description} ${project.tags.join(' ')}`.toLowerCase();
            show = searchableText.includes(searchTerm);
        }

        // Show/hide card with animation
        animateCardVisibility(card, show);
    });

    // Show "no results" message if needed
    showNoResultsMessage(projectCards);
}

// Animate card visibility
function animateCardVisibility(card, show) {
    if (show) {
        card.style.display = 'block';
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 50);
    } else {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        setTimeout(() => {
            card.style.display = 'none';
        }, 300);
    }
}

// Show no results message
function showNoResultsMessage(projectCards) {
    const visibleCards = Array.from(projectCards).filter(card => 
        card.style.display !== 'none' && card.style.opacity !== '0'
    );
    
    let noResultsMsg = document.getElementById('noResultsMessage');
    const projectsContainer = document.querySelector('#projects .row');
    
    if (visibleCards.length === 0) {
        if (!noResultsMsg && projectsContainer) {
            noResultsMsg = document.createElement('div');
            noResultsMsg.id = 'noResultsMessage';
            noResultsMsg.className = 'col-12 text-center mt-5';
            noResultsMsg.innerHTML = `
                <div class="no-results">
                    <i class="bi bi-search" style="font-size: 3rem; color: #6c757d; margin-bottom: 1rem;"></i>
                    <h4>No projects found</h4>
                    <p class="text-muted">Try adjusting your search terms or filter selection.</p>
                </div>
            `;
            projectsContainer.appendChild(noResultsMsg);
        }
    } else {
        if (noResultsMsg) {
            noResultsMsg.remove();
        }
    }
}

// Initialize animations
function initAnimations() {
    // Add entrance animations to cards
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe project cards
    document.querySelectorAll('.project-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
}

// Get projects data (this would typically come from a separate data file)
function getProjectsData() {
    return [
        {
            id: 'python-ml',
            title: 'Python ML Pipeline',
            description: 'End-to-end machine learning pipeline for predictive analytics using scikit-learn, pandas, and automated model validation.',
            tags: ['python', 'scikit-learn', 'pandas', 'machine-learning', 'ml']
        },
        {
            id: 'r-dashboard',
            title: 'R Statistical Dashboard',
            description: 'Interactive statistical analysis dashboard with real-time data visualization using R Shiny and ggplot2.',
            tags: ['r', 'shiny', 'ggplot2', 'statistics', 'dashboard']
        },
        {
            id: 'gee-monitor',
            title: 'GEE Environmental Monitor',
            description: 'Large-scale environmental monitoring system using Google Earth Engine for satellite imagery analysis and change detection.',
            tags: ['gee', 'google-earth-engine', 'javascript', 'remote-sensing', 'environment']
        }
    ];
}