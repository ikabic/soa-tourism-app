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

    public async Task<KeyPointResponse> AddKeyPointAsync(string authorId, Guid tourId, CreateKeyPointRequest request)
    {
        var tour = await tourRepository.GetByIdAsync(tourId)
            ?? throw new KeyNotFoundException("Tour not found");

        if (tour.AuthorId != authorId)
            throw new UnauthorizedAccessException("You are not the author of this tour");

        var order = tour.KeyPoints.Count + 1;

        var keyPoint = new KeyPoint
        {
            TourId = tourId,
            Name = request.Name,
            Description = request.Description,
            Latitude = request.Latitude,
            Longitude = request.Longitude,
            ImageUrl = request.ImageUrl,
            Order = order
        };

        if (order > 1)
        {
            var prev = tour.KeyPoints.OrderBy(k => k.Order).Last();
            var addedDistance = CalculateDistance(prev.Latitude, prev.Longitude, request.Latitude, request.Longitude);
            tour.LengthInKm = (tour.LengthInKm ?? 0) + addedDistance;
            await tourRepository.UpdateAsync(tour);
        }

        var created = await tourRepository.AddKeyPointAsync(keyPoint);
        return MapToKeyPointResponse(created);
    }

    public async Task<List<KeyPointResponse>> GetKeyPointsAsync(string authorId, Guid tourId)
    {
        var tour = await tourRepository.GetByIdAsync(tourId)
            ?? throw new KeyNotFoundException("Tour not found");

        if (tour.AuthorId != authorId)
            throw new UnauthorizedAccessException("You are not the author of this tour");

        var keyPoints = await tourRepository.GetKeyPointsByTourIdAsync(tourId);
        return keyPoints.Select(MapToKeyPointResponse).ToList();
    }

    private static double CalculateDistance(double lat1, double lon1, double lat2, double lon2)
    {
        const double earthRadiusKm = 6371;
        var dLat = ToRad(lat2 - lat1);
        var dLon = ToRad(lon2 - lon1);
        var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                Math.Cos(ToRad(lat1)) * Math.Cos(ToRad(lat2)) *
                Math.Sin(dLon / 2) * Math.Sin(dLon / 2);
        return earthRadiusKm * 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
    }

    private static double ToRad(double deg) => deg * Math.PI / 180;

    private static KeyPointResponse MapToKeyPointResponse(KeyPoint kp) => new()
    {
        Id = kp.Id,
        TourId = kp.TourId,
        Name = kp.Name,
        Description = kp.Description,
        Latitude = kp.Latitude,
        Longitude = kp.Longitude,
        ImageUrl = kp.ImageUrl,
        Order = kp.Order
    };

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
