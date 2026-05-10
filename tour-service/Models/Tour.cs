using TourService.Models.Enums;

namespace TourService.Models;

public class Tour
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string AuthorId { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string Description { get; set; } = null!;
    public Difficulty Difficulty { get; set; }
    public List<string> Tags { get; set; } = [];
    public TourStatus Status { get; set; } = TourStatus.Draft;
    public decimal Price { get; set; } = 0;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? PublishedAt { get; set; }
    public DateTime? ArchivedAt { get; set; }
    public double? LengthInKm { get; set; }

    public List<KeyPoint> KeyPoints { get; set; } = [];
    public List<TourDuration> Durations { get; set; } = [];
}
