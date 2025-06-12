"""
python/grid_planting.py

Simple grid-based tree planting pattern generator
Based on row and between tree spacing
"""

import matplotlib.pyplot as plt
import numpy as np
from typing import List, Tuple


def generate_grid_trees(acres: float, row_spacing: float, tree_spacing: float, 
                       add_randomness: bool = True) -> List[Tuple[float, float]]:
    """
    Generate trees in a grid pattern.
    
    Args:
        acres: Area in acres
        row_spacing: Distance between rows in meters
        tree_spacing: Distance between trees within a row in meters
        add_randomness: Whether to add random offset to tree positions
        
    Returns:
        List of (x, y) tree coordinates
    """
    # Calculate plot dimensions
    plot_area_m2 = acres * 4046.86
    plot_side = np.sqrt(plot_area_m2)
    
    # Generate grid coordinates
    x_coords = np.arange(0, plot_side + tree_spacing, tree_spacing)
    y_coords = np.arange(0, plot_side + row_spacing, row_spacing)
    
    tree_x, tree_y = [], []
    
    for y in y_coords:
        for x in x_coords:
            if add_randomness:
                # Add slight random offset for natural appearance
                x += np.random.uniform(-0.3, 0.3)
                y += np.random.uniform(-0.3, 0.3)
            
            tree_x.append(x)
            tree_y.append(y)
    
    return list(zip(tree_x, tree_y))


def visualize_grid_trees(trees: List[Tuple[float, float]], acres: float, 
                        title: str = "Grid Tree Planting Pattern"):
    """
    Visualize grid tree pattern.
    
    Args:
        trees: List of (x, y) tree coordinates
        acres: Area in acres for plot boundary
        title: Plot title
    """
    plot_area_m2 = acres * 4046.86
    plot_side = np.sqrt(plot_area_m2)
    
    if trees:
        tree_x, tree_y = zip(*trees)
        
        plt.figure(figsize=(8, 8))
        plt.scatter(tree_x, tree_y)
        plt.plot([0, plot_side, plot_side, 0, 0], 
                [0, 0, plot_side, plot_side, 0], 'k--')  # boundary box
        plt.xlabel("meters")
        plt.ylabel("meters")
        plt.title(f"{title}\n({len(trees)} trees)")
        plt.axis([0, plot_side, 0, plot_side])
        plt.gca().set_aspect('equal', adjustable='box')
        plt.show()
        
        print(f"Total trees: {len(trees)}")
        print(f"Trees per acre: {len(trees) / acres:.1f}")


if __name__ == "__main__":
    # Test the function
    acres = 1.0
    row_spacing = 4.87  # meters between rows
    tree_spacing = 4.87  # meters between trees within a row
    
    trees = generate_grid_trees(acres, row_spacing, tree_spacing)
    visualize_grid_trees(trees, acres)