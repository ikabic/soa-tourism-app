using System.ComponentModel.DataAnnotations;

namespace TourService.DTOs;

public class CreateKeyPointRequest
{
    [Required]
    public string Name { get; set; } = null!;

    [Required]
    public string Description { get; set; } = null!;

    [Required]
    public double Latitude { get; set; }

    [Required]
    public double Longitude { get; set; }

    public string? ImageUrl { get; set; }
}
