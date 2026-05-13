using TourService.Models.Enums;

namespace TourService.DTOs;

public class PublicTourResponse
{
    public Guid Id { get; set; }
    public string Name { get; set; } = null!;
    public string Description { get; set; } = null!;
    public Difficulty Difficulty { get; set; }
    public List<string> Tags { get; set; } = [];
    public decimal Price { get; set; }
    public double? LengthInKm { get; set; }
    public DateTime PublishedAt { get; set; }
    public List<TourDurationResponse> Durations { get; set; } = [];
    public KeyPointResponse? FirstKeyPoint { get; set; }
    public List<KeyPointResponse>? KeyPoints { get; set; }
    public bool IsPurchased { get; set; }
}
