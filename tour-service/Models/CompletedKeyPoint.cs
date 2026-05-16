namespace TourService.Models;

public class CompletedKeyPoint
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid TourExecutionId { get; set; }
    public Guid KeyPointId { get; set; }
    public DateTime CompletedAt { get; set; } = DateTime.UtcNow;
    public TourExecution TourExecution { get; set; } = null!;
}