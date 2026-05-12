using System.ComponentModel.DataAnnotations;
using TourService.Models.Enums;

namespace TourService.DTOs;

public class CreateTourRequest
{
    [Required]
    public string Name { get; set; } = null!;

    [Required]
    public string Description { get; set; } = null!;

    [Required]
    public Difficulty Difficulty { get; set; }

    [Required]
    public List<string> Tags { get; set; } = [];

    public decimal Price { get; set; } = 0;
}
