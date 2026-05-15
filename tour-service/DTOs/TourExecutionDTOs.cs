using TourService.Models.Enums;

namespace TourService.DTOs;

public class StartExecutionRequest
{
    public double Latitude { get; set; }
    public double Longitude { get; set; }
}

public class CheckPositionRequest
{
    public double Latitude { get; set; }
    public double Longitude { get; set; }
}

public class TourExecutionResponse
{
    public Guid Id { get; set; }
    public Guid TourId { get; set; }
    public string TouristId { get; set; } = null!;
    public TourExecutionStatus Status { get; set; }
    public DateTime StartedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public DateTime? AbandonedAt { get; set; }
    public DateTime LastActivity { get; set; }
    public double StartLatitude { get; set; }
    public double StartLongitude { get; set; }
    public List<Guid> CompletedKeyPointIds { get; set; } = [];
}

public class CheckPositionResponse
{
    public bool NearKeyPoint { get; set; }
    public Guid? CompletedKeyPointId { get; set; }
    public string? KeyPointName { get; set; }
    public bool TourCompleted { get; set; }
}