using TourService.Models.Enums;

namespace TourService.Models;

public class TourExecution
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid TourId { get; set; }
    public string TouristId { get; set; } = null!;
    public TourExecutionStatus Status { get; set; } = TourExecutionStatus.Active;
    public DateTime StartedAt { get; set; } = DateTime.UtcNow;
    public DateTime? CompletedAt { get; set; }
    public DateTime? AbandonedAt { get; set; }
    public DateTime LastActivity { get; set; } = DateTime.UtcNow;
    public double StartLatitude { get; set; }
    public double StartLongitude { get; set; }
    public List<CompletedKeyPoint> CompletedKeyPoints { get; set; } = [];
    public Tour Tour { get; set; } = null!;
}