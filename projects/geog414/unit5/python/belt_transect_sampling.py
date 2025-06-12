"""
python/belt_transect_sampling.py

Simple belt transect sampling for forest inventory.
"""

import matplotlib.pyplot as plt
import numpy as np
from typing import List, Tuple, Dict


def count_trees_in_belt_transect(trees: List[Tuple[float, float]], 
                                center_x: float, center_y: float, 
                                width: float, length: float) -> int:
    """
    Count trees within a rectangular belt transect.
    
    Args:
        trees: List of (x, y) tree coordinates
        center_x: Belt center x coordinate
        center_y: Belt center y coordinate
        width: Belt width in meters
        length: Belt length in meters
        
    Returns:
        Number of trees within the belt
    """
    count = 0
    
    # Calculate belt boundaries
    left = center_x - length / 2
    right = center_x + length / 2
    bottom = center_y - width / 2
    top = center_y + width / 2
    
    for tree_x, tree_y in trees:
        if left <= tree_x <= right and bottom <= tree_y <= top:
            count += 1
    
    return count


def conduct_belt_transect_sampling(trees: List[Tuple[float, float]], acres: float,
                                  sample_intensity_percent: float, belt_width: float, 
                                  belt_length: float) -> Dict:
    """
    Conduct belt transect sampling of trees.
    
    Args:
        trees: List of (x, y) tree coordinates
        acres: Area in acres
        sample_intensity_percent: Percentage of area to sample
        belt_width: Width of each belt in meters
        belt_length: Length of each belt in meters
        
    Returns:
        Dictionary with sampling results
    """
    # Calculate plot dimensions
    plot_area_m2 = acres * 4046.86
    plot_side = np.sqrt(plot_area_m2)
    
    # Calculate sampling requirements
    sample_area_m2 = plot_area_m2 * (sample_intensity_percent / 100)
    individual_plot_area_m2 = belt_width * belt_length
    num_plots = max(1, int(np.round(sample_area_m2 / individual_plot_area_m2)))
    
    # Generate random belt centers
    plot_centers = []
    max_attempts = num_plots * 20
    attempts = 0
    min_distance = 15.0  # Minimum distance between belt centers
    
    while len(plot_centers) < num_plots and attempts < max_attempts:
        candidate = (
            np.random.uniform(belt_length/2, plot_side - belt_length/2),
            np.random.uniform(belt_width/2, plot_side - belt_width/2)
        )
        
        # Check minimum distance to existing plots
        valid_position = all(
            np.sqrt((candidate[0] - p[0])**2 + (candidate[1] - p[1])**2) >= min_distance
            for p in plot_centers
        )
        
        if valid_position:
            plot_centers.append(candidate)
        
        attempts += 1
    
    # Count trees in each belt
    plot_tree_counts = []
    for center_x, center_y in plot_centers:
        tree_count = count_trees_in_belt_transect(trees, center_x, center_y, 
                                                 belt_width, belt_length)
        plot_tree_counts.append(tree_count)
    
    # Calculate results using CORRECT expansion factor
    total_trees_counted = sum(plot_tree_counts)
    mean_trees_per_plot = total_trees_counted / len(plot_centers) if plot_centers else 0
    
    # CORRECT expansion factor calculation
    c = 4046.86 / individual_plot_area_m2  # How many plots fit in 1 acre
    expansion_factor = c / len(plot_centers)  # Expansion factor
    
    estimated_tpa = mean_trees_per_plot * expansion_factor
    
    # Actual TPA for comparison
    actual_tpa = len(trees) / acres
    
    # Sampling accuracy
    accuracy_percent = (estimated_tpa / actual_tpa * 100) if actual_tpa > 0 else 0
    
    return {
        'num_plots': len(plot_centers),
        'belt_width': belt_width,
        'belt_length': belt_length,
        'individual_plot_area_m2': individual_plot_area_m2,
        'expansion_factor': expansion_factor,
        'total_trees_counted': total_trees_counted,
        'mean_trees_per_plot': mean_trees_per_plot,
        'estimated_tpa': estimated_tpa,
        'actual_tpa': actual_tpa,
        'accuracy_percent': accuracy_percent,
        'plot_centers': plot_centers,
        'tree_counts': plot_tree_counts
    }


def visualize_belt_transect_sampling(trees: List[Tuple[float, float]], results: Dict, 
                                   acres: float, title: str = "Belt Transect Sampling"):
    """
    Visualize trees and belt transects.
    
    Args:
        trees: List of (x, y) tree coordinates
        results: Results from conduct_belt_transect_sampling
        acres: Area in acres
        title: Plot title
    """
    plot_area_m2 = acres * 4046.86
    plot_side = np.sqrt(plot_area_m2)
    
    fig, ax = plt.subplots(figsize=(10, 10))
    
    # Plot trees
    if trees:
        tree_x, tree_y = zip(*trees)
        ax.scatter(tree_x, tree_y, c='darkgreen', s=15, alpha=0.6, label='Trees')
    
    # Plot belt transects
    for i, (center_x, center_y) in enumerate(results['plot_centers']):
        # Calculate rectangle corners
        left = center_x - results['belt_length'] / 2
        bottom = center_y - results['belt_width'] / 2
        
        rect = plt.Rectangle(
            (left, bottom),
            results['belt_length'],
            results['belt_width'],
            fill=False,
            edgecolor='blue',
            linewidth=2,
            alpha=0.8
        )
        ax.add_patch(rect)
        
        # Add tree count label
        tree_count = results['tree_counts'][i]
        ax.text(center_x, center_y, str(tree_count), 
               ha='center', va='center', fontweight='bold', 
               bbox=dict(boxstyle='round', facecolor='white', alpha=0.8))
    
    # Plot boundary
    ax.plot([0, plot_side, plot_side, 0, 0], 
            [0, 0, plot_side, plot_side, 0], 'k-', linewidth=3)
    
    ax.set_xlim(0, plot_side)
    ax.set_ylim(0, plot_side)
    ax.set_xlabel('Distance (meters)')
    ax.set_ylabel('Distance (meters)')
    ax.set_title(f"{title}\n"
                f"Estimated TPA: {results['estimated_tpa']:.1f} | "
                f"Actual TPA: {results['actual_tpa']:.1f} | "
                f"Accuracy: {results['accuracy_percent']:.1f}%")
    ax.set_aspect('equal')
    ax.grid(True, alpha=0.3)
    ax.legend()
    
    plt.tight_layout()
    plt.show()
    
    # Print results
    print(f"Results Summary:")
    print(f"  Number of plots: {results['num_plots']}")
    print(f"  Belt dimensions: {results['belt_length']}m × {results['belt_width']}m")
    print(f"  Expansion factor: {results['expansion_factor']:.2f}")
    print(f"  Trees counted: {results['total_trees_counted']}")
    print(f"  Mean trees per plot: {results['mean_trees_per_plot']:.2f}")
    print(f"  Estimated TPA: {results['estimated_tpa']:.1f}")
    print(f"  Actual TPA: {results['actual_tpa']:.1f}")
    print(f"  Accuracy: {results['accuracy_percent']:.1f}%")


if __name__ == "__main__":
    # Example from your question: 12.5 acres, 1.5% sample intensity, 30m×6m belt
    from grid_planting import generate_grid_trees
    
    acres = 12.5
    trees = generate_grid_trees(acres, 5.0, 5.0)
    
    print(f"Generated {len(trees)} test trees on {acres} acres")
    
    # Test belt transect sampling
    results = conduct_belt_transect_sampling(
        trees=trees,
        acres=acres,
        sample_intensity_percent=1.5,
        belt_width=6.0,
        belt_length=30.0
    )
    
    print(f"\nExpansion factor calculation verification:")
    print(f"  c = 4046.86 / 180 = {4046.86 / 180:.2f}")
    print(f"  expansion_factor = c / total_plots = {4046.86 / 180:.2f} / {results['num_plots']} = {results['expansion_factor']:.2f}")
    
    visualize_belt_transect_sampling(trees, results, acres)