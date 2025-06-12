"""
python/ico_planting.py

Individual Clump Opening Configuration

"""

import matplotlib.pyplot as plt
import numpy as np
from typing import List, Tuple


def generate_non_overlapping_centers(count: int, min_dist: float, plot_side: float) -> List[Tuple[float, float]]:
    centers = []
    max_attempts = 2000
    attempts = 0
    
    while len(centers) < count and attempts < max_attempts:
        candidate = (
            np.random.uniform(0, plot_side),
            np.random.uniform(0, plot_side)
        )
        
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

def generate_triangle_cluster(center: Tuple[float, float], triangle_spacing: float) -> List[Tuple[float, float]]:
    trees = []
    angles = np.deg2rad([0, 120, 240])
    radius = triangle_spacing / np.sqrt(3)
    rotation = np.random.uniform(-15, 15)
    rotation_rad = np.radians(rotation)
    cos_r = np.cos(rotation_rad)
    sin_r = np.sin(rotation_rad)

    center_offset_x = np.random.uniform(-0.3, 0.3)
    center_offset_y = np.random.uniform(-0.3, 0.3)
    adjusted_center = (center[0] + center_offset_x, center[1] + center_offset_y)
    
    for angle in angles:
        x_base = radius * np.cos(angle)
        y_base = radius * np.sin(angle)
        x_rot = x_base * cos_r - y_base * sin_r
        y_rot = x_base * sin_r + y_base * cos_r
        final_x = adjusted_center[0] + x_rot
        final_y = adjusted_center[1] + y_rot
        
        trees.append((final_x, final_y))
    
    return trees

def generate_clump(center: Tuple[float, float], triangle_spacing: float, single_tree_spacing: float) -> List[Tuple[float, float]]:
    trees = generate_triangle_cluster(center, triangle_spacing)

    angle = np.random.uniform(0, 2 * np.pi)
    single_tree_x = center[0] + single_tree_spacing * np.cos(angle)
    single_tree_y = center[1] + single_tree_spacing * np.sin(angle)
    
    trees.append((single_tree_x, single_tree_y))

    return trees

def generate_cluster_trees_with_opening(acres: float, target_tpa: int, triangle_spacing: float, 
                                        single_tree_spacing: float, cluster_spacing: float) -> List[Tuple[float, float]]:
    plot_area_m2 = acres * 4046.86
    plot_side = np.sqrt(plot_area_m2)
    
    target_trees = int(target_tpa * acres)
    num_clusters = max(1, target_trees // 4)
    
    centers = generate_non_overlapping_centers(num_clusters, cluster_spacing, plot_side)
    
    all_trees = []
    for center in centers:
        clump_trees = generate_clump(center, triangle_spacing, single_tree_spacing)
        
        for tree in clump_trees:
            if 0 <= tree[0] <= plot_side and 0 <= tree[1] <= plot_side:
                all_trees.append(tree)
    
    return all_trees

def visualize_cluster_trees(trees: List[Tuple[float, float]], acres: float, 
                            title: str = "Cluster Tree Planting Pattern"):
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
    # Example usage
    acres = 1.0
    target_tpa = 150
    triangle_spacing = 2.4
    single_tree_spacing = 3.2
    cluster_spacing = 9.8

    trees = generate_cluster_trees_with_opening(
        acres, target_tpa, triangle_spacing, single_tree_spacing, cluster_spacing
    )
    visualize_cluster_trees(trees, acres, title="Clump Planting Pattern with Opening")