using TourService.Models.Enums;

namespace TourService.DTOs;

public class TourDurationResponse
{
    public Guid Id { get; set; }
    public Guid TourId { get; set; }
    public TransportType TransportType { get; set; }
    public int DurationInMinutes { get; set; }
}
