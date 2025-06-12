"""
python/cluster_planting.py

Simple cluster-based tree planting pattern generator.
Based on triangle cluster code.
"""

import matplotlib.pyplot as plt
import numpy as np
from typing import List, Tuple


def generate_non_overlapping_centers(count: int, min_dist: float, plot_side: float) -> List[Tuple[float, float]]:
    """
    Generate non-overlapping cluster centers.
    
    Args:
        count: Number of centers to generate
        min_dist: Minimum distance between centers
        plot_side: Size of plot in meters
        
    Returns:
        List of (x, y) center coordinates
    """
    centers = []
    max_attempts = 2000
    attempts = 0
    
    while len(centers) < count and attempts < max_attempts:
        candidate = (
            np.random.uniform(0, plot_side),
            np.random.uniform(0, plot_side)
        )
        
        # Check if candidate is far enough from existing centers
        valid_position = all(
            np.sqrt((candidate[0] - c[0])**2 + (candidate[1] - c[1])**2) >= min_dist 
            for c in centers
        )
        
        if valid_position:
            centers.append(candidate)
        
        attempts += 1
    
    if len(centers) < count:
        print(f"Warning: Could only place {len(centers)} clusters out of {count} requested")
    
    return centers


def generate_cluster_trees(acres: float, target_tpa: int, triangle_spacing: float, 
                          cluster_spacing: float) -> List[Tuple[float, float]]:
    """
    Generate clustered tree planting pattern.
    
    Args:
        acres: Area in acres
        target_tpa: Target trees per acre
        triangle_spacing: Distance between trees in each triangle cluster
        cluster_spacing: Minimum distance between cluster centers
        
    Returns:
        List of (x, y) tree coordinates
    """
    # Calculate plot dimensions
    plot_area_m2 = acres * 4046.86
    plot_side = np.sqrt(plot_area_m2)
    
    # Calculate target number of trees and clusters
    target_trees = int(target_tpa * acres)
    trees_per_cluster = 3
    num_clusters = max(1, target_trees // trees_per_cluster)
    
    # Generate cluster centers
    centers = generate_non_overlapping_centers(num_clusters, cluster_spacing, plot_side)
    
    # Generate trees for each cluster
    all_trees = []
    for center in centers:
        cluster_trees = generate_triangle_cluster(center, triangle_spacing)
        
        # Filter trees that are within plot boundaries
        for tree_x, tree_y in cluster_trees:
            if 0 <= tree_x <= plot_side and 0 <= tree_y <= plot_side:
                all_trees.append((tree_x, tree_y))
    
    # Trim to target count if we have too many trees
    if len(all_trees) > target_trees:
        all_trees = all_trees[:target_trees]
    
    return all_trees


def generate_triangle_cluster(center: Tuple[float, float], triangle_spacing: float) -> List[Tuple[float, float]]:
    """
    Generate a triangular cluster of 3 trees.
    
    Args:
        center: (x, y) center of cluster
        triangle_spacing: Distance between trees in triangle
        
    Returns:
        List of (x, y) tree coordinates
    """
    trees = []
    
    # Equilateral triangle angles (0°, 120°, 240°)
    angles = np.deg2rad([0, 120, 240])
    radius = triangle_spacing / np.sqrt(3)
    
    # Random rotation for natural appearance
    rotation = np.random.uniform(-15, 15)
    rotation_rad = np.radians(rotation)
    
    # Rotation matrix
    cos_r = np.cos(rotation_rad)
    sin_r = np.sin(rotation_rad)
    
    # Add slight offset to cluster center
    center_offset_x = np.random.uniform(-0.3, 0.3)
    center_offset_y = np.random.uniform(-0.3, 0.3)
    adjusted_center = (center[0] + center_offset_x, center[1] + center_offset_y)
    
    for angle in angles:
        # Base position
        x_base = radius * np.cos(angle)
        y_base = radius * np.sin(angle)
        
        # Apply rotation
        x_rot = x_base * cos_r - y_base * sin_r
        y_rot = x_base * sin_r + y_base * cos_r
        
        # Final position
        final_x = adjusted_center[0] + x_rot
        final_y = adjusted_center[1] + y_rot
        
        trees.append((final_x, final_y))
    
    return trees


def visualize_cluster_trees(trees: List[Tuple[float, float]], acres: float, 
                           title: str = "Cluster Tree Planting Pattern"):
    """
    Visualize clustered tree pattern.
    
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
        plt.scatter(tree_x, tree_y, c='darkgreen', s=25, alpha=0.8)
        plt.plot([0, plot_side, plot_side, 0, 0], 
                [0, 0, plot_side, plot_side, 0], 'k--', linewidth=2)
        plt.xlabel("meters")
        plt.ylabel("meters")
        plt.title(f"{title}\n({len(trees)} trees)")
        plt.axis([0, plot_side, 0, plot_side])
        plt.gca().set_aspect('equal', adjustable='box')
        plt.grid(True, alpha=0.3)
        plt.show()
        
        print(f"Total trees: {len(trees)}")
        print(f"Trees per acre: {len(trees) / acres:.1f}")


if __name__ == "__main__":
    # Test the function
    acres = 1.0
    target_tpa = 150
    triangle_spacing = 2.4  # Distance between trees in triangle
    cluster_spacing = 9.8   # Distance between cluster centers
    
    trees = generate_cluster_trees(acres, target_tpa, triangle_spacing, cluster_spacing)
    visualize_cluster_trees(trees, acres)