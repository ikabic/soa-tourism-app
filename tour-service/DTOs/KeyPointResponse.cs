namespace TourService.DTOs;

public class KeyPointResponse
{
    public Guid Id { get; set; }
    public Guid TourId { get; set; }
    public string Name { get; set; } = null!;
    public string Description { get; set; } = null!;
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public string? ImageUrl { get; set; }
    public int Order { get; set; }
}
