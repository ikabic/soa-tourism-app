using TourService.Models.Enums;

namespace TourService.Models;

public class TourDuration
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid TourId { get; set; }
    public TransportType TransportType { get; set; }
    public int DurationInMinutes { get; set; }

    public Tour Tour { get; set; } = null!;
}
