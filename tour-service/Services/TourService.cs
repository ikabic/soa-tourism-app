using System.Linq;
using TourService.Clients;
using TourService.DTOs;
using TourService.Models;
using TourService.Models.Enums;
using TourService.Repositories;

namespace TourService.Services;

public class TourService : ITourService
{
    private readonly ITourRepository tourRepository;
    private readonly IPurchaseClient purchaseClient;

    public TourService(ITourRepository tourRepository, IPurchaseClient purchaseClient)
    {
        this.tourRepository = tourRepository;
        this.purchaseClient = purchaseClient;
    }

    public async Task<TourResponse> CreateTourAsync(string authorId, CreateTourRequest request)
    {
        var tour = new Tour
        {
            AuthorId = authorId,
            Name = request.Name,
            Description = request.Description,
            Difficulty = request.Difficulty,
            Tags = request.Tags,
            Price = request.Price
        };

        var created = await tourRepository.CreateAsync(tour);
        return MapToResponse(created);
    }

    public async Task<List<TourResponse>> GetMyToursAsync(string authorId)
    {
        var tours = await tourRepository.GetByAuthorIdAsync(authorId);
        return tours.Select(MapToResponse).ToList();
    }

    public async Task<TourResponse> GetTourAsync(string authorId, Guid tourId)
    {
        var tour = await tourRepository.GetByIdAsync(tourId)
            ?? throw new KeyNotFoundException("Tour not found");

        if (tour.AuthorId != authorId)
            throw new UnauthorizedAccessException("You are not the author of this tour");

        return MapToResponse(tour);
    }

    public async Task<PublicTourResponse> GetPublicTourAsync(string userId, string authorizationHeader, Guid tourId)
    {
        var tour = await tourRepository.GetByIdAsync(tourId)
            ?? throw new KeyNotFoundException("Tour not found");

        var isAuthor = tour.AuthorId == userId;
        var isPublished = tour.Status == TourStatus.Published;

        if (!isAuthor && !isPublished)
            throw new UnauthorizedAccessException("Tour is not available");

        var response = MapToPublicResponse(tour);
        if (isAuthor)
        {
            response.KeyPoints = tour.KeyPoints.OrderBy(k => k.Order).Select(MapToKeyPointResponse).ToList();
            response.IsPurchased = true;
            return response;
        }

        var purchased = await purchaseClient.HasPurchasedAsync(authorizationHeader, tourId);
        if (purchased)
        {
            response.KeyPoints = tour.KeyPoints.OrderBy(k => k.Order).Select(MapToKeyPointResponse).ToList();
            response.IsPurchased = true;
        }

        return response;
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

    public async Task<TourDurationResponse> AddDurationAsync(string authorId, Guid tourId, CreateTourDurationRequest request)
    {
        var tour = await tourRepository.GetByIdAsync(tourId)
            ?? throw new KeyNotFoundException("Tour not found");

        if (tour.AuthorId != authorId)
            throw new UnauthorizedAccessException("You are not the author of this tour");

        var duration = new TourDuration
        {
            TourId = tourId,
            TransportType = request.TransportType,
            DurationInMinutes = request.DurationInMinutes
        };

        var created = await tourRepository.AddDurationAsync(duration);
        return MapToDurationResponse(created);
    }

    public async Task<TourResponse> UpdateTourAsync(string authorId, Guid tourId, UpdateTourRequest request)
    {
        var tour = await tourRepository.GetByIdAsync(tourId)
            ?? throw new KeyNotFoundException("Tour not found");

        if (tour.AuthorId != authorId)
            throw new UnauthorizedAccessException("You are not the author of this tour");

        if (tour.Status != TourStatus.Draft)
            throw new InvalidOperationException("Only draft tours can be edited");

        if (string.IsNullOrWhiteSpace(request.Name) || string.IsNullOrWhiteSpace(request.Description))
            throw new InvalidOperationException("Tour must have a name and description");

        tour.Name = request.Name;
        tour.Description = request.Description;
        tour.Difficulty = request.Difficulty;
        tour.Tags = request.Tags;
        tour.Price = request.Price;

        await tourRepository.UpdateAsync(tour);
        return MapToResponse(tour);
    }

    public async Task<TourResponse> PublishTourAsync(string authorId, Guid tourId)
    {
        var tour = await tourRepository.GetByIdAsync(tourId)
            ?? throw new KeyNotFoundException("Tour not found");

        if (tour.AuthorId != authorId)
            throw new UnauthorizedAccessException("You are not the author of this tour");

        if (tour.Status != TourStatus.Draft)
            throw new InvalidOperationException("Only draft tours can be published");

        if (string.IsNullOrWhiteSpace(tour.Name) || string.IsNullOrWhiteSpace(tour.Description))
            throw new InvalidOperationException("Tour must have a name and description");

        if (tour.Tags == null || tour.Tags.Count == 0)
            throw new InvalidOperationException("Tour must have at least one tag");

        if (tour.KeyPoints.Count < 2)
            throw new InvalidOperationException("Tour must have at least 2 key points");

        if (tour.Durations.Count == 0)
            throw new InvalidOperationException("Tour must have at least one duration");

        tour.Status = TourStatus.Published;
        tour.PublishedAt = DateTime.UtcNow;

        await tourRepository.UpdateAsync(tour);
        return MapToResponse(tour);
    }

    public async Task<TourResponse> ArchiveTourAsync(string authorId, Guid tourId)
    {
        var tour = await tourRepository.GetByIdAsync(tourId)
            ?? throw new KeyNotFoundException("Tour not found");

        if (tour.AuthorId != authorId)
            throw new UnauthorizedAccessException("You are not the author of this tour");

        if (tour.Status != TourStatus.Published)
            throw new InvalidOperationException("Only published tours can be archived");

        tour.Status = TourStatus.Archived;
        tour.ArchivedAt = DateTime.UtcNow;

        await tourRepository.UpdateAsync(tour);
        return MapToResponse(tour);
    }

    public async Task<TourResponse> ActivateTourAsync(string authorId, Guid tourId)
    {
        var tour = await tourRepository.GetByIdAsync(tourId)
            ?? throw new KeyNotFoundException("Tour not found");

        if (tour.AuthorId != authorId)
            throw new UnauthorizedAccessException("You are not the author of this tour");

        if (tour.Status != TourStatus.Archived)
            throw new InvalidOperationException("Only archived tours can be reactivated");

        tour.Status = TourStatus.Published;
        tour.ArchivedAt = null;

        await tourRepository.UpdateAsync(tour);
        return MapToResponse(tour);
    }

    public async Task<List<PublishedTourResponse>> GetPublishedToursAsync()
    {
        var tours = await tourRepository.GetPublishedToursAsync();
        return tours.Select(t =>
        {
            var firstKeyPoint = t.KeyPoints.MinBy(k => k.Order);
            return new PublishedTourResponse
            {
                Id = t.Id,
                Name = t.Name,
                Description = t.Description,
                Difficulty = t.Difficulty,
                Tags = t.Tags,
                Price = t.Price,
                LengthInKm = t.LengthInKm,
                PublishedAt = t.PublishedAt!.Value,
                Durations = t.Durations.Select(MapToDurationResponse).ToList(),
                FirstKeyPoint = firstKeyPoint != null ? MapToKeyPointResponse(firstKeyPoint) : null
            };
        }).ToList();
    }

    private static TourDurationResponse MapToDurationResponse(TourDuration d) => new()
    {
        Id = d.Id,
        TourId = d.TourId,
        TransportType = d.TransportType,
        DurationInMinutes = d.DurationInMinutes
    };

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
        LengthInKm = tour.LengthInKm,
        KeyPoints = tour.KeyPoints.OrderBy(k => k.Order).Select(MapToKeyPointResponse).ToList(),
        Durations = tour.Durations.Select(MapToDurationResponse).ToList()
    };

    private static PublicTourResponse MapToPublicResponse(Tour tour) => new()
    {
        Id = tour.Id,
        Name = tour.Name,
        Description = tour.Description,
        Difficulty = tour.Difficulty,
        Tags = tour.Tags,
        Price = tour.Price,
        LengthInKm = tour.LengthInKm,
        PublishedAt = tour.PublishedAt ?? DateTime.MinValue,
        Durations = tour.Durations.Select(MapToDurationResponse).ToList(),
        FirstKeyPoint = tour.KeyPoints.OrderBy(k => k.Order).Select(MapToKeyPointResponse).FirstOrDefault()
    };

    public async Task<KeyPointResponse> UpdateKeyPointAsync(string authorId, Guid tourId, Guid keyPointId, UpdateKeyPointResponse request)
    {
        var tour = await tourRepository.GetByIdAsync(tourId) ?? throw new KeyNotFoundException("Tour not found");

        if (tour.AuthorId != authorId)
            throw new UnauthorizedAccessException();

        if (tour.Status != TourStatus.Draft)
            throw new InvalidOperationException("Key points can only be modified on draft tours");

        var keyPoint = tour.KeyPoints.FirstOrDefault(k => k.Id == keyPointId)
            ?? throw new KeyNotFoundException("Key point not found");

        keyPoint.Name = request.Name;
        keyPoint.Description = request.Description;
        keyPoint.ImageUrl = request.ImageUrl;
        keyPoint.Latitude = request.Latitude;
        keyPoint.Longitude = request.Longitude;

        await tourRepository.UpdateKeyPointAsync(keyPoint);

        tour.LengthInKm = RecalculateLength([.. tour.KeyPoints.OrderBy(k => k.Order)]);
        await tourRepository.UpdateAsync(tour);

        return MapToKeyPointResponse(keyPoint);
    }

    public async Task DeleteKeyPointAsync(string authorId, Guid tourId, Guid keyPointId)
    {
        var tour = await tourRepository.GetByIdAsync(tourId) ?? throw new KeyNotFoundException("Tour not found");

        if (tour.AuthorId != authorId)
            throw new UnauthorizedAccessException();

        if (tour.Status != TourStatus.Draft)
            throw new InvalidOperationException("Key points can only be deleted from draft tours");

        var keyPoint = tour.KeyPoints.FirstOrDefault(k => k.Id == keyPointId) ?? throw new KeyNotFoundException("Key point not found");

        await tourRepository.DeleteKeyPointAsync(keyPoint);

        var remaining = tour.KeyPoints
            .Where(k => k.Id != keyPointId)
            .OrderBy(k => k.Order)
            .ToList();

        for (int i = 0; i < remaining.Count; i++)
        {
            remaining[i].Order = i + 1;
            await tourRepository.UpdateKeyPointAsync(remaining[i]);
        }

        tour.LengthInKm = RecalculateLength(remaining);
        await tourRepository.UpdateAsync(tour);
    }

    private static double RecalculateLength(List<KeyPoint> ordered)
    {
        double total = 0;
        for (int i = 1; i < ordered.Count; i++)
            total += CalculateDistance(ordered[i - 1].Latitude, ordered[i - 1].Longitude, ordered[i].Latitude, ordered[i].Longitude);
        return total;
    }
}
