using TourService.Clients;
using TourService.DTOs;
using TourService.Models;
using TourService.Models.Enums;
using TourService.Repositories;

namespace TourService.Services;

public class TourExecutionService(
    ITourExecutionRepository executionRepository,
    ITourRepository tourRepository,
    IPurchaseClient purchaseClient) : ITourExecutionService
{
    private const double ProximityRadiusKm = 0.05; 

    public async Task<TourExecutionResponse> StartExecutionAsync(string touristId, string authHeader, Guid tourId, StartExecutionRequest request)
    {
        var tour = await tourRepository.GetByIdAsync(tourId)
            ?? throw new KeyNotFoundException("Tour not found");

        if (tour.Status == TourStatus.Draft)
            throw new InvalidOperationException("Cannot start a draft tour");

        var purchased = await purchaseClient.HasPurchasedAsync(touristId, tourId);
        if (!purchased)
            throw new InvalidOperationException("Tour must be purchased before starting");

        var existing = await executionRepository.GetActiveByTouristAndTourAsync(touristId, tourId);
        if (existing != null)
            return MapToResponse(existing);

        var execution = new TourExecution
        {
            TourId = tourId,
            TouristId = touristId,
            StartLatitude = request.Latitude,
            StartLongitude = request.Longitude,
        };

        var created = await executionRepository.CreateAsync(execution);
        return MapToResponse(created);
    }

    public async Task<TourExecutionResponse> CompleteExecutionAsync(string touristId, Guid executionId)
    {
        var execution = await executionRepository.GetByIdAsync(executionId)
            ?? throw new KeyNotFoundException("Execution not found");

        if (execution.TouristId != touristId)
            throw new UnauthorizedAccessException();

        if (execution.Status != TourExecutionStatus.Active)
            throw new InvalidOperationException("Execution is not active");

        execution.Status = TourExecutionStatus.Completed;
        execution.CompletedAt = DateTime.UtcNow;
        execution.LastActivity = DateTime.UtcNow;

        await executionRepository.UpdateAsync(execution);
        return MapToResponse(execution);
    }

    public async Task<TourExecutionResponse> AbandonExecutionAsync(string touristId, Guid executionId)
    {
        var execution = await executionRepository.GetByIdAsync(executionId)
            ?? throw new KeyNotFoundException("Execution not found");

        if (execution.TouristId != touristId)
            throw new UnauthorizedAccessException();

        if (execution.Status != TourExecutionStatus.Active)
            throw new InvalidOperationException("Execution is not active");

        execution.Status = TourExecutionStatus.Abandoned;
        execution.AbandonedAt = DateTime.UtcNow;
        execution.LastActivity = DateTime.UtcNow;

        await executionRepository.UpdateAsync(execution);
        return MapToResponse(execution);
    }

    public async Task<CheckPositionResponse> CheckPositionAsync(string touristId, Guid executionId, CheckPositionRequest request)
    {
        var execution = await executionRepository.GetByIdAsync(executionId)
            ?? throw new KeyNotFoundException("Execution not found");

        if (execution.TouristId != touristId)
            throw new UnauthorizedAccessException();

        if (execution.Status != TourExecutionStatus.Active)
            throw new InvalidOperationException("Execution is not active");

        execution.LastActivity = DateTime.UtcNow;

        var tour = await tourRepository.GetByIdAsync(execution.TourId) ?? throw new KeyNotFoundException("Tour not found");

        KeyPoint? nearbyKeyPoint = null;
        foreach (var kp in tour.KeyPoints)
        {
            var distance = CalculateDistance(request.Latitude, request.Longitude, kp.Latitude, kp.Longitude);
            if (distance <= ProximityRadiusKm)
            {
                var alreadyCompleted = await executionRepository.IsKeyPointCompletedAsync(execution.Id, kp.Id);
                if (!alreadyCompleted)
                {
                    nearbyKeyPoint = kp;
                    break;
                }
            }
        }

        CompletedKeyPoint? completedKp = null;
        if (nearbyKeyPoint != null)
        {
            completedKp = new CompletedKeyPoint
            {
                TourExecutionId = execution.Id,
                KeyPointId = nearbyKeyPoint.Id,
            };
            await executionRepository.AddCompletedKeyPointAsync(completedKp);
            execution.CompletedKeyPoints.Add(completedKp);
        }

        var allCompleted = tour.KeyPoints.Count > 0 &&
            tour.KeyPoints.All(kp => execution.CompletedKeyPoints.Any(ckp => ckp.KeyPointId == kp.Id));

        if (allCompleted)
        {
            execution.Status = TourExecutionStatus.Completed;
            execution.CompletedAt = DateTime.UtcNow;
        }

        await executionRepository.UpdateAsync(execution);

        return new CheckPositionResponse
        {
            NearKeyPoint = nearbyKeyPoint != null,
            CompletedKeyPointId = completedKp?.KeyPointId,
            KeyPointName = nearbyKeyPoint?.Name,
            TourCompleted = allCompleted,
        };
    }

    public async Task<TourExecutionResponse?> GetActiveExecutionAsync(string touristId, Guid tourId)
    {
        var execution = await executionRepository.GetActiveByTouristAndTourAsync(touristId, tourId);
        return execution == null ? null : MapToResponse(execution);
    }

    private static double CalculateDistance(double lat1, double lon1, double lat2, double lon2)
    {
        const double earthRadiusKm = 6371;
        var dLat = ToRad(lat2 - lat1);
        var dLon = ToRad(lon2 - lon1);
        var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) + Math.Cos(ToRad(lat1)) * Math.Cos(ToRad(lat2)) * Math.Sin(dLon / 2) * Math.Sin(dLon / 2);
        return earthRadiusKm * 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
    }

    private static double ToRad(double deg) => deg * Math.PI / 180;

    private static TourExecutionResponse MapToResponse(TourExecution e) => new()
    {
        Id = e.Id,
        TourId = e.TourId,
        TouristId = e.TouristId,
        Status = e.Status,
        StartedAt = e.StartedAt,
        CompletedAt = e.CompletedAt,
        AbandonedAt = e.AbandonedAt,
        LastActivity = e.LastActivity,
        StartLatitude = e.StartLatitude,
        StartLongitude = e.StartLongitude,
        CompletedKeyPointIds = e.CompletedKeyPoints.Select(c => c.KeyPointId).ToList(),
    };

    public async Task<TourExecutionResponse?> GetByIdAsync(string touristId, Guid executionId)
    {
      var execution = await executionRepository.GetByIdAsync(executionId);

      if (execution == null)
          return null;

      if (execution.TouristId != touristId)
          throw new UnauthorizedAccessException();

      return MapToResponse(execution);
    }
}