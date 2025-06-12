// js/main.js - Main application logic for Reforestation Simulator

// Global variables
let map;
let treeLayer;
let plotLayer;
let currentTrees = [];
let currentPlots = [];

/**
 * Initialize the Leaflet map
 */
function initMap() {
    const acres = parseFloat(document.getElementById('acres').value);
    const areaM2 = acres * 4046.86;
    const plotSide = Math.sqrt(areaM2);
    
    const bounds = [[0, 0], [plotSide, plotSide]];
    
    if (map) {
        map.remove();
    }
    
    map = L.map('map', {
        crs: L.CRS.Simple,
        minZoom: -2,
        maxZoom: 3
    });

    map.fitBounds(bounds);
    
    // Add background
    const rect = L.rectangle(bounds, {
        color: '#2c5530',
        fillColor: '#f8fdf9',
        fillOpacity: 0.3,
        weight: 3
    }).addTo(map);

    treeLayer = L.layerGroup().addTo(map);
    plotLayer = L.layerGroup().addTo(map);
}

/**
 * Generate trees based on selected pattern
 */
function generateTrees() {
    const acres = parseFloat(document.getElementById('acres').value);
    const targetTPA = parseInt(document.getElementById('target-tpa').value);
    const pattern = document.querySelector('.toggle-btn.active[id$="-btn"]').id;
    
    const areaM2 = acres * 4046.86;
    const plotSide = Math.sqrt(areaM2);
    const targetTrees = Math.round(targetTPA * acres);
    
    currentTrees = [];
    
    if (pattern === 'grid-btn') {
        currentTrees = generateGridPattern(plotSide, targetTrees);
    } else {
        currentTrees = generateClusterPattern(plotSide, targetTrees);
    }
    
    // Trim to target count
    if (currentTrees.length > targetTrees) {
        currentTrees = currentTrees.slice(0, targetTrees);
    }
    
    renderTrees();
    updateStats();
}

/**
 * Generate grid pattern trees
 */
function generateGridPattern(plotSide, targetTrees) {
    const treeSpacing = parseFloat(document.getElementById('tree-spacing').value);
    const rowSpacing = parseFloat(document.getElementById('row-spacing').value);
    const trees = [];
    
    for (let x = treeSpacing/2; x < plotSide; x += treeSpacing) {
        for (let y = rowSpacing/2; y < plotSide; y += rowSpacing) {
            const jitterX = (Math.random() - 0.5) * 0.6;
            const jitterY = (Math.random() - 0.5) * 0.6;
            const finalX = Math.max(0, Math.min(plotSide, x + jitterX));
            const finalY = Math.max(0, Math.min(plotSide, y + jitterY));
            trees.push([finalX, finalY]);
        }
    }
    
    return trees;
}

/**
 * Generate cluster pattern trees
 */
function generateClusterPattern(plotSide, targetTrees) {
    const triangleSpacing = parseFloat(document.getElementById('triangle-spacing').value);
    const clusterSpacing = parseFloat(document.getElementById('cluster-spacing').value);
    const trees = [];
    
    const numClusters = Math.ceil(targetTrees / 3);
    const clusters = generateClusterCenters(numClusters, clusterSpacing, plotSide);
    
    clusters.forEach(center => {
        const radius = triangleSpacing / Math.sqrt(3);
        const angles = [0, 120, 240];
        const rotation = Math.random() * 60 - 30;
        
        angles.forEach(angle => {
            const radians = (angle + rotation) * Math.PI / 180;
            const x = center[0] + radius * Math.cos(radians) + (Math.random() - 0.5) * 0.4;
            const y = center[1] + radius * Math.sin(radians) + (Math.random() - 0.5) * 0.4;
            
            if (x >= 0 && x <= plotSide && y >= 0 && y <= plotSide) {
                trees.push([x, y]);
            }
        });
    });
    
    return trees;
}

/**
 * Generate non-overlapping cluster centers
 */
function generateClusterCenters(count, minDist, plotSide) {
    const centers = [];
    const maxAttempts = count * 15;
    let attempts = 0;
    
    while (centers.length < count && attempts < maxAttempts) {
        const candidate = [
            Math.random() * plotSide,
            Math.random() * plotSide
        ];
        
        const validPosition = centers.every(center => {
            const dx = candidate[0] - center[0];
            const dy = candidate[1] - center[1];
            return Math.sqrt(dx * dx + dy * dy) >= minDist;
        });
        
        if (validPosition) {
            centers.push(candidate);
        }
        attempts++;
    }
    
    return centers;
}

/**
 * Render trees on the map
 */
function renderTrees() {
    treeLayer.clearLayers();
    
    currentTrees.forEach(tree => {
        L.circleMarker([tree[1], tree[0]], {
            radius: 4,
            fillColor: '#2d5a27',
            color: '#1e3a1a',
            weight: 1,
            opacity: 1,
            fillOpacity: 0.85
        }).addTo(treeLayer);
    });
}

/**
 * Generate sampling plots
 */
function generateSampling() {
    const acres = parseFloat(document.getElementById('acres').value);
    const sampleIntensity = parseFloat(document.getElementById('sample-intensity').value);
    const plotType = document.querySelector('#radius-btn.active') ? 'radius' : 'belt';
    
    const areaM2 = acres * 4046.86;
    const plotSide = Math.sqrt(areaM2);
    const sampleAreaM2 = areaM2 * (sampleIntensity / 100);
    
    let plotAreaM2;
    if (plotType === 'radius') {
        const radius = parseFloat(document.getElementById('plot-radius').value);
        plotAreaM2 = Math.PI * radius * radius;
    } else {
        const width = parseFloat(document.getElementById('belt-width').value);
        const length = parseFloat(document.getElementById('belt-length').value);
        plotAreaM2 = width * length;
    }
    
    const numPlots = Math.max(1, Math.round(sampleAreaM2 / plotAreaM2));
    
    // Generate plot centers
    currentPlots = [];
    const maxAttempts = numPlots * 25;
    let attempts = 0;
    
    while (currentPlots.length < numPlots && attempts < maxAttempts) {
        const x = Math.random() * plotSide;
        const y = Math.random() * plotSide;
        
        const minDistance = Math.sqrt(plotAreaM2) * 1.5;
        const validPosition = currentPlots.every(plot => {
            const dx = x - plot.x;
            const dy = y - plot.y;
            return Math.sqrt(dx * dx + dy * dy) >= minDistance;
        });
        
        if (validPosition) {
            currentPlots.push({
                x: x,
                y: y,
                type: plotType,
                treesCount: 0
            });
        }
        attempts++;
    }
    
    // Count trees in plots
    currentPlots.forEach(plot => {
        plot.treesCount = countTreesInPlot(plot);
    });
    
    renderPlots();
    updateSamplingStats();
}

/**
 * Count trees within a plot
 */
function countTreesInPlot(plot) {
    let count = 0;
    
    if (plot.type === 'radius') {
        const radius = parseFloat(document.getElementById('plot-radius').value);
        currentTrees.forEach(tree => {
            const dx = tree[0] - plot.x;
            const dy = tree[1] - plot.y;
            if (Math.sqrt(dx * dx + dy * dy) <= radius) {
                count++;
            }
        });
    } else { // belt
        const width = parseFloat(document.getElementById('belt-width').value);
        const length = parseFloat(document.getElementById('belt-length').value);
        currentTrees.forEach(tree => {
            if (tree[0] >= plot.x - length/2 && tree[0] <= plot.x + length/2 &&
                tree[1] >= plot.y - width/2 && tree[1] <= plot.y + width/2) {
                count++;
            }
        });
    }
    
    return count;
}

/**
 * Render plots on the map
 */
function renderPlots() {
    plotLayer.clearLayers();
    
    currentPlots.forEach(plot => {
        let shape;
        
        if (plot.type === 'radius') {
            const radius = parseFloat(document.getElementById('plot-radius').value);
            shape = L.circle([plot.y, plot.x], {
                radius: radius,
                fillColor: 'red',
                color: 'darkred',
                weight: 3,
                opacity: 0.9,
                fillOpacity: 0.15
            });
        } else {
            const width = parseFloat(document.getElementById('belt-width').value);
            const length = parseFloat(document.getElementById('belt-length').value);
            shape = L.rectangle([
                [plot.y - width/2, plot.x - length/2],
                [plot.y + width/2, plot.x + length/2]
            ], {
                fillColor: 'blue',
                color: 'darkblue',
                weight: 3,
                opacity: 0.9,
                fillOpacity: 0.15
            });
        }
        
        shape.addTo(plotLayer);
        
        // Add count label
        L.marker([plot.y, plot.x], {
            icon: L.divIcon({
                html: `<div style="background: white; border: 2px solid #333; border-radius: 50%; width: 24px; height: 24px; text-align: center; line-height: 20px; font-size: 12px; font-weight: bold; box-shadow: 0 2px 6px rgba(0,0,0,0.3);">${plot.treesCount}</div>`,
                iconSize: [24, 24],
                className: 'tree-count-marker'
            })
        }).addTo(plotLayer);
    });
}

/**
 * Update basic statistics
 */
function updateStats() {
    const acres = parseFloat(document.getElementById('acres').value);
    const actualTPA = Math.round(currentTrees.length / acres);
    
    document.getElementById('total-trees').textContent = currentTrees.length;
    document.getElementById('actual-tpa').textContent = actualTPA;
    document.getElementById('area-display').textContent = Math.round(acres * 4046.86).toLocaleString() + ' m²';
}

/**
 * Update sampling statistics with correct expansion factor calculation
 */
function updateSamplingStats() {
    const acres = parseFloat(document.getElementById('acres').value);
    const plotType = document.querySelector('#radius-btn.active') ? 'radius' : 'belt';
    
    let plotAreaM2;
    if (plotType === 'radius') {
        const radius = parseFloat(document.getElementById('plot-radius').value);
        plotAreaM2 = Math.PI * radius * radius;
    } else {
        const width = parseFloat(document.getElementById('belt-width').value);
        const length = parseFloat(document.getElementById('belt-length').value);
        plotAreaM2 = width * length;
    }
    
    // CORRECT expansion factor calculation
    const c = 4046.86 / plotAreaM2;
    const expansionFactor = c / currentPlots.length;
    
    const totalTreesCountedInPlots = currentPlots.reduce((sum, plot) => sum + plot.treesCount, 0);
    const meanTreesPerPlot = currentPlots.length > 0 ? totalTreesCountedInPlots / currentPlots.length : 0;
    const estimatedTPA = Math.round(meanTreesPerPlot * expansionFactor);
    
    const actualTPA = Math.round(currentTrees.length / acres);
    const accuracy = actualTPA > 0 ? Math.round((estimatedTPA / actualTPA) * 100) : 0;
    
    document.getElementById('num-plots').textContent = currentPlots.length;
    document.getElementById('expansion-factor').textContent = expansionFactor.toFixed(2);
    document.getElementById('estimated-tpa').textContent = estimatedTPA;
    document.getElementById('accuracy').textContent = accuracy + '%';
}

/**
 * Initialize event listeners and start the application
 */
function initializeApp() {
    initMap();
    
    // Pattern toggles
    document.getElementById('grid-btn').addEventListener('click', function() {
        document.querySelectorAll('#grid-btn, #cluster-btn').forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');
        document.getElementById('grid-controls').style.display = 'block';
        document.getElementById('cluster-controls').style.display = 'none';
    });
    
    document.getElementById('cluster-btn').addEventListener('click', function() {
        document.querySelectorAll('#grid-btn, #cluster-btn').forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');
        document.getElementById('grid-controls').style.display = 'none';
        document.getElementById('cluster-controls').style.display = 'block';
    });
    
    // Sampling method toggles
    document.getElementById('radius-btn').addEventListener('click', function() {
        document.querySelectorAll('#radius-btn, #belt-btn').forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');
        document.getElementById('radius-controls').style.display = 'block';
        document.getElementById('belt-controls').style.display = 'none';
    });
    
    document.getElementById('belt-btn').addEventListener('click', function() {
        document.querySelectorAll('#radius-btn, #belt-btn').forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');
        document.getElementById('radius-controls').style.display = 'none';
        document.getElementById('belt-controls').style.display = 'block';
    });
    
    // Update area display when acres change
    document.getElementById('acres').addEventListener('input', function() {
        const acres = parseFloat(this.value);
        const areaM2 = Math.round(acres * 4046.86);
        document.getElementById('area-display').textContent = areaM2.toLocaleString() + ' m²';
        initMap(); // Recreate map with new bounds
    });
    
    // Generate buttons
    document.getElementById('generate-trees').addEventListener('click', generateTrees);
    document.getElementById('generate-sampling').addEventListener('click', generateSampling);
    
    // Initial generation
    generateTrees();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeApp);