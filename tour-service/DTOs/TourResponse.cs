using TourService.Models.Enums;

namespace TourService.DTOs;

public class TourResponse
{
    public Guid Id { get; set; }
    public string AuthorId { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string Description { get; set; } = null!;
    public Difficulty Difficulty { get; set; }
    public List<string> Tags { get; set; } = [];
    public TourStatus Status { get; set; }
    public decimal Price { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? PublishedAt { get; set; }
    public DateTime? ArchivedAt { get; set; }
    public double? LengthInKm { get; set; }
    public List<KeyPointResponse> KeyPoints { get; set; } = [];
    public List<TourDurationResponse> Durations { get; set; } = [];
}
