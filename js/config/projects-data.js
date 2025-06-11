// config/projects-data.js - Centralized project data and metadata

// Main project data structure
export const projects = [
    {
        id: 'python-ml-pipeline',
        title: 'Python ML Pipeline',
        description: 'End-to-end machine learning pipeline for predictive analytics using scikit-learn, pandas, and automated model validation.',
        longDescription: 'A comprehensive machine learning pipeline that automates data preprocessing, feature engineering, model training, and validation. Built with Python and deployed using Docker containers.',
        tags: ['python', 'scikit-learn', 'pandas', 'machine-learning', 'ml', 'docker', 'automation'],
        category: 'python',
        technologies: ['Python', 'Scikit-learn', 'Pandas', 'NumPy', 'Docker'],
        githubUrl: 'https://github.com/yourusername/ml-pipeline',
        liveUrl: null,
        imageUrl: 'images/projects/python/ml-pipeline.png',
        featured: true,
        dateCreated: '2024-01-15',
        status: 'completed'
    },
    {
        id: 'r-statistical-dashboard',
        title: 'R Statistical Dashboard',
        description: 'Interactive statistical analysis dashboard with real-time data visualization using R Shiny and ggplot2.',
        longDescription: 'A dynamic web application built with R Shiny that provides interactive statistical analysis capabilities. Features real-time data updates and publication-ready visualizations.',
        tags: ['r', 'shiny', 'ggplot2', 'statistics', 'dashboard', 'visualization', 'interactive'],
        category: 'r',
        technologies: ['R', 'Shiny', 'ggplot2', 'dplyr', 'plotly'],
        githubUrl: 'https://github.com/yourusername/r-dashboard',
        liveUrl: 'https://yourusername.shinyapps.io/statistical-dashboard/',
        imageUrl: 'images/projects/r/dashboard.png',
        featured: true,
        dateCreated: '2024-02-10',
        status: 'completed'
    },
    {
        id: 'gee-environmental-monitor',
        title: 'GEE Environmental Monitor',
        description: 'Large-scale environmental monitoring system using Google Earth Engine for satellite imagery analysis and change detection.',
        longDescription: 'An environmental monitoring system that leverages Google Earth Engine\'s planetary-scale analysis capabilities to track deforestation, urban expansion, and climate change indicators.',
        tags: ['gee', 'google-earth-engine', 'javascript', 'remote-sensing', 'environment', 'satellite', 'monitoring'],
        category: 'gee',
        technologies: ['Google Earth Engine', 'JavaScript', 'Python', 'NDVI', 'Landsat'],
        githubUrl: 'https://github.com/yourusername/gee-monitor',
        liveUrl: 'https://yourusername.github.io/gee-monitor/',
        imageUrl: 'images/projects/gee/environmental-monitor.png',
        featured: true,
        dateCreated: '2024-03-05',
        status: 'in-progress'
    },
    {
        id: 'python-data-viz',
        title: 'Python Data Visualization Suite',
        description: 'Comprehensive data visualization library built with Python, featuring interactive charts and publication-ready plots.',
        longDescription: 'A Python package that simplifies complex data visualization tasks with a focus on statistical graphics and interactive dashboards.',
        tags: ['python', 'matplotlib', 'seaborn', 'plotly', 'visualization', 'data-analysis'],
        category: 'python',
        technologies: ['Python', 'Matplotlib', 'Seaborn', 'Plotly', 'Bokeh'],
        githubUrl: 'https://github.com/yourusername/data-viz-suite',
        liveUrl: null,
        imageUrl: 'images/projects/python/data-viz.png',
        featured: false,
        dateCreated: '2023-11-20',
        status: 'completed'
    },
    {
        id: 'r-time-series',
        title: 'R Time Series Analysis',
        description: 'Advanced time series forecasting models using R for financial and economic data analysis.',
        longDescription: 'Implementation of ARIMA, GARCH, and machine learning models for time series forecasting with a focus on financial markets.',
        tags: ['r', 'time-series', 'forecasting', 'arima', 'finance', 'economics'],
        category: 'r',
        technologies: ['R', 'forecast', 'tseries', 'quantmod', 'xts'],
        githubUrl: 'https://github.com/yourusername/r-timeseries',
        liveUrl: null,
        imageUrl: 'images/projects/r/timeseries.png',
        featured: false,
        dateCreated: '2023-12-15',
        status: 'completed'
    },
    {
        id: 'gee-crop-monitoring',
        title: 'GEE Crop Monitoring System',
        description: 'Agricultural monitoring system using satellite data to track crop health and predict yields.',
        longDescription: 'A precision agriculture solution that uses NDVI and other vegetation indices to monitor crop health and optimize farming practices.',
        tags: ['gee', 'agriculture', 'ndvi', 'crop-monitoring', 'satellite', 'farming'],
        category: 'gee',
        technologies: ['Google Earth Engine', 'Sentinel-2', 'MODIS', 'Python', 'JavaScript'],
        githubUrl: 'https://github.com/yourusername/crop-monitor',
        liveUrl: null,
        imageUrl: 'images/projects/gee/crop-monitor.png',
        featured: false,
        dateCreated: '2024-01-30',
        status: 'in-progress'
    }
];

// Project categories for filtering
export const categories = [
    { id: 'all', name: 'All Projects', icon: 'bi-grid' },
    { id: 'python', name: 'Python', icon: 'bi-code-square' },
    { id: 'r', name: 'R', icon: 'bi-bar-chart' },
    { id: 'gee', name: 'Google Earth Engine', icon: 'bi-globe' }
];

// Technology tags with colors
export const technologyColors = {
    'python': 'bg-primary',
    'r': 'bg-success',
    'javascript': 'bg-warning',
    'gee': 'bg-info',
    'google-earth-engine': 'bg-info',
    'machine-learning': 'bg-danger',
    'statistics': 'bg-secondary',
    'visualization': 'bg-dark',
    'dashboard': 'bg-success',
    'remote-sensing': 'bg-info',
    'environment': 'bg-success'
};

// Helper functions
export function getFeaturedProjects() {
    return projects.filter(project => project.featured);
}

export function getProjectsByCategory(category) {
    if (category === 'all') return projects;
    return projects.filter(project => project.category === category);
}

export function getProjectById(id) {
    return projects.find(project => project.id === id);
}

export function searchProjects(query) {
    const searchTerm = query.toLowerCase();
    return projects.filter(project => {
        const searchableText = `${project.title} ${project.description} ${project.tags.join(' ')}`.toLowerCase();
        return searchableText.includes(searchTerm);
    });
}

export function getProjectsByTag(tag) {
    return projects.filter(project => project.tags.includes(tag));
}

export function getAllTags() {
    const allTags = new Set();
    projects.forEach(project => {
        project.tags.forEach(tag => allTags.add(tag));
    });
    return Array.from(allTags).sort();
}

export function getProjectStats() {
    return {
        total: projects.length,
        completed: projects.filter(p => p.status === 'completed').length,
        inProgress: projects.filter(p => p.status === 'in-progress').length,
        python: projects.filter(p => p.category === 'python').length,
        r: projects.filter(p => p.category === 'r').length,
        gee: projects.filter(p => p.category === 'gee').length
    };
}