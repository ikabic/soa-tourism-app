using TourService.DTOs;
using TourService.Models;
using TourService.Repositories;

namespace TourService.Services;

public class TourService(ITourRepository tourRepository) : ITourService
{
    public async Task<TourResponse> CreateTourAsync(string authorId, CreateTourRequest request)
    {
        var tour = new Tour
        {
            AuthorId = authorId,
            Name = request.Name,
            Description = request.Description,
            Difficulty = request.Difficulty,
            Tags = request.Tags
        };

        var created = await tourRepository.CreateAsync(tour);
        return MapToResponse(created);
    }

    public async Task<List<TourResponse>> GetMyToursAsync(string authorId)
    {
        var tours = await tourRepository.GetByAuthorIdAsync(authorId);
        return tours.Select(MapToResponse).ToList();
    }

    private static TourResponse MapToResponse(Tour tour) => new()
    {
        Id = tour.Id,
        AuthorId = tour.AuthorId,
        Name = tour.Name,
        Description = tour.Description,
        Difficulty = tour.Difficulty,
        Tags = tour.Tags,
        Status = tour.Status,
        Price = tour.Price,
        CreatedAt = tour.CreatedAt,
        PublishedAt = tour.PublishedAt,
        ArchivedAt = tour.ArchivedAt,
        LengthInKm = tour.LengthInKm
    };
}
