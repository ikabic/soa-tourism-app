using System.ComponentModel.DataAnnotations;
using TourService.Models.Enums;

namespace TourService.DTOs;

public class CreateTourDurationRequest
{
    [Required]
    public TransportType TransportType { get; set; }

    [Required]
    [Range(1, int.MaxValue)]
    public int DurationInMinutes { get; set; }
}
