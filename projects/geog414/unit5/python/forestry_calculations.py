"""
python/forestry_calculations.py

Core forestry calculations and formulas for expansion factors and TPA estimates.
"""


def calculate_expansion_factor(plot_area_m2: float, num_plots: int) -> float:
    """
    Calculate expansion factor using correct forestry methodology.
    
    Args:
        plot_area_m2: Individual plot area in square meters
        num_plots: Total number of sample plots
        
    Returns:
        Expansion factor
    """
    # c = how many plots of this size would fit in 1 acre
    c = 4046.86 / plot_area_m2
    
    # Expansion factor = c / number of plots used
    expansion_factor = c / num_plots
    
    return expansion_factor


def calculate_plot_area_radius(radius_meters: float) -> float:
    """
    Calculate area of circular radius plot.
    
    Args:
        radius_meters: Plot radius in meters
        
    Returns:
        Plot area in square meters
    """
    import math
    return math.pi * (radius_meters ** 2)


def calculate_plot_area_belt(width_meters: float, length_meters: float) -> float:
    """
    Calculate area of rectangular belt transect.
    
    Args:
        width_meters: Belt width in meters
        length_meters: Belt length in meters
        
    Returns:
        Plot area in square meters
    """
    return width_meters * length_meters


def calculate_estimated_tpa(trees_counted: int, expansion_factor: float, num_plots: int) -> float:
    """
    Calculate estimated trees per acre.
    
    Args:
        trees_counted: Total trees counted across all plots
        expansion_factor: Calculated expansion factor
        num_plots: Number of sample plots
        
    Returns:
        Estimated trees per acre
    """
    mean_trees_per_plot = trees_counted / num_plots if num_plots > 0 else 0
    estimated_tpa = mean_trees_per_plot * expansion_factor
    return estimated_tpa


def calculate_sampling_accuracy(estimated_tpa: float, actual_tpa: float) -> float:
    """
    Calculate sampling accuracy percentage.
    
    Args:
        estimated_tpa: Estimated trees per acre from sampling
        actual_tpa: Actual trees per acre
        
    Returns:
        Accuracy percentage
    """
    if actual_tpa == 0:
        return 0.0
    
    accuracy = (estimated_tpa / actual_tpa) * 100
    return accuracy


def convert_acres_to_m2(acres: float) -> float:
    """
    Convert acres to square meters.
    
    Args:
        acres: Area in acres
        
    Returns:
        Area in square meters
    """
    return acres * 4046.86


def convert_m2_to_acres(area_m2: float) -> float:
    """
    Convert square meters to acres.
    
    Args:
        area_m2: Area in square meters
        
    Returns:
        Area in acres
    """
    return area_m2 / 4046.86


def calculate_required_plots(total_area_acres: float, sample_intensity_percent: float, 
                           individual_plot_area_m2: float) -> int:
    """
    Calculate number of plots needed for desired sampling intensity.
    
    Args:
        total_area_acres: Total area to be sampled in acres
        sample_intensity_percent: Desired sampling intensity (1-100%)
        individual_plot_area_m2: Area of each individual plot in m²
        
    Returns:
        Number of plots required
    """
    total_area_m2 = convert_acres_to_m2(total_area_acres)
    sample_area_m2 = total_area_m2 * (sample_intensity_percent / 100)
    num_plots = max(1, round(sample_area_m2 / individual_plot_area_m2))
    return num_plots


def validate_sampling_design(total_area_acres: float, sample_intensity_percent: float,
                            plot_area_m2: float, min_plots: int = 3, max_plots: int = 50) -> dict:
    """
    Validate sampling design parameters and provide recommendations.
    
    Args:
        total_area_acres: Total area in acres
        sample_intensity_percent: Sample intensity percentage
        plot_area_m2: Individual plot area in square meters
        min_plots: Minimum recommended number of plots
        max_plots: Maximum practical number of plots
        
    Returns:
        Dictionary with validation results and recommendations
    """
    num_plots = calculate_required_plots(total_area_acres, sample_intensity_percent, plot_area_m2)
    expansion_factor = calculate_expansion_factor(plot_area_m2, num_plots)
    
    warnings = []
    recommendations = []
    
    # Check minimum plots
    if num_plots < min_plots:
        warnings.append(f"Only {num_plots} plots - minimum {min_plots} recommended for statistical validity")
        recommendations.append("Increase sample intensity or use smaller plots")
    
    # Check maximum plots
    if num_plots > max_plots:
        warnings.append(f"{num_plots} plots may be impractical for field work")
        recommendations.append("Consider decreasing sample intensity or using larger plots")
    
    # Check expansion factor reasonableness
    if expansion_factor < 1:
        warnings.append("Expansion factor < 1 indicates over-sampling")
    elif expansion_factor > 100:
        warnings.append("Very high expansion factor may reduce precision")
        recommendations.append("Consider increasing sample intensity")
    
    # Check plot size relative to area
    plot_area_acres = convert_m2_to_acres(plot_area_m2)
    if plot_area_acres > total_area_acres * 0.1:
        warnings.append("Individual plots are large relative to total area")
        recommendations.append("Consider using smaller plots")
    
    return {
        'num_plots': num_plots,
        'expansion_factor': expansion_factor,
        'plot_area_acres': plot_area_acres,
        'warnings': warnings,
        'recommendations': recommendations,
        'is_valid': len(warnings) == 0
    }


def calculate_sampling_precision(tree_counts: list, expansion_factor: float) -> dict:
    """
    Calculate precision metrics for sampling results.
    
    Args:
        tree_counts: List of tree counts from each plot
        expansion_factor: Calculated expansion factor
        
    Returns:
        Dictionary with precision statistics
    """
    import math
    
    if not tree_counts or len(tree_counts) < 2:
        return {'error': 'Need at least 2 plots for precision calculation'}
    
    n = len(tree_counts)
    mean_count = sum(tree_counts) / n
    
    # Calculate variance and standard deviation
    variance = sum((x - mean_count) ** 2 for x in tree_counts) / (n - 1)
    std_dev = math.sqrt(variance)
    
    # Convert to TPA scale
    mean_tpa = mean_count * expansion_factor
    std_error_tpa = (std_dev / math.sqrt(n)) * expansion_factor
    
    # Calculate confidence interval (95%)
    t_value = 2.0 if n >= 30 else {2: 12.7, 3: 4.3, 4: 3.2, 5: 2.8, 10: 2.3}.get(n, 2.1)
    confidence_interval = t_value * std_error_tpa
    
    # Coefficient of variation
    cv_percent = (std_dev / mean_count * 100) if mean_count > 0 else 0
    
    return {
        'num_plots': n,
        'mean_trees_per_plot': mean_count,
        'std_dev_trees_per_plot': std_dev,
        'mean_tpa': mean_tpa,
        'std_error_tpa': std_error_tpa,
        'confidence_interval_95': confidence_interval,
        'cv_percent': cv_percent,
        'lower_ci': mean_tpa - confidence_interval,
        'upper_ci': mean_tpa + confidence_interval
    }


def compare_sampling_methods(results_method1: dict, results_method2: dict, 
                           method1_name: str = "Method 1", method2_name: str = "Method 2") -> dict:
    """
    Compare two sampling methods statistically.
    
    Args:
        results_method1: Results from first sampling method
        results_method2: Results from second sampling method  
        method1_name: Name of first method
        method2_name: Name of second method
        
    Returns:
        Dictionary with comparison results
    """
    comparison = {
        'method1_name': method1_name,
        'method2_name': method2_name,
        'method1_tpa': results_method1.get('estimated_tpa', 0),
        'method2_tpa': results_method2.get('estimated_tpa', 0),
        'method1_accuracy': results_method1.get('accuracy_percent', 0),
        'method2_accuracy': results_method2.get('accuracy_percent', 0)
    }
    
    # Determine which method is more accurate
    if comparison['method1_accuracy'] > comparison['method2_accuracy']:
        comparison['more_accurate'] = method1_name
        comparison['accuracy_difference'] = comparison['method1_accuracy'] - comparison['method2_accuracy']
    else:
        comparison['more_accurate'] = method2_name
        comparison['accuracy_difference'] = comparison['method2_accuracy'] - comparison['method1_accuracy']
    
    # Compare efficiency (accuracy per plot)
    method1_plots = results_method1.get('num_plots', 1)
    method2_plots = results_method2.get('num_plots', 1)
    
    comparison['method1_efficiency'] = comparison['method1_accuracy'] / method1_plots
    comparison['method2_efficiency'] = comparison['method2_accuracy'] / method2_plots
    
    if comparison['method1_efficiency'] > comparison['method2_efficiency']:
        comparison['more_efficient'] = method1_name
    else:
        comparison['more_efficient'] = method2_name
    
    return comparison


# Example usage and testing functions
def run_example_calculations():
    """Run example calculations to demonstrate the functions."""
    print("=== Forestry Calculations Examples ===\n")
    
    # Example 1: Basic expansion factor calculation
    print("1. Expansion Factor Calculation:")
    plot_area = calculate_plot_area_radius(3.5)  # 3.5m radius plot
    expansion_factor = calculate_expansion_factor(plot_area, 4)  # 4 plots
    print(f"   Plot area: {plot_area:.2f} m²")
    print(f"   Expansion factor: {expansion_factor:.2f}")
    
    # Example 2: Sampling design validation
    print("\n2. Sampling Design Validation:")
    validation = validate_sampling_design(
        total_area_acres=12.5,
        sample_intensity_percent=1.5,
        plot_area_m2=180  # 30m × 6m belt
    )
    print(f"   Number of plots: {validation['num_plots']}")
    print(f"   Expansion factor: {validation['expansion_factor']:.2f}")
    print(f"   Valid design: {validation['is_valid']}")
    if validation['warnings']:
        print(f"   Warnings: {validation['warnings']}")
    
    # Example 3: TPA estimation
    print("\n3. TPA Estimation:")
    tree_counts = [2, 3, 1, 4, 2]  # Trees counted in 5 plots
    total_counted = sum(tree_counts)
    estimated_tpa = calculate_estimated_tpa(total_counted, expansion_factor, len(tree_counts))
    print(f"   Trees counted: {tree_counts}")
    print(f"   Total counted: {total_counted}")
    print(f"   Estimated TPA: {estimated_tpa:.1f}")
    
    # Example 4: Precision calculation
    print("\n4. Precision Analysis:")
    precision = calculate_sampling_precision(tree_counts, expansion_factor)
    if 'error' not in precision:
        print(f"   Mean TPA: {precision['mean_tpa']:.1f}")
        print(f"   Standard error: ±{precision['std_error_tpa']:.1f}")
        print(f"   95% CI: {precision['lower_ci']:.1f} - {precision['upper_ci']:.1f}")
        print(f"   Coefficient of variation: {precision['cv_percent']:.1f}%")


if __name__ == "__main__":
    run_example_calculations()