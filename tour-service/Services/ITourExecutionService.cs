using TourService.DTOs;

namespace TourService.Services;

public interface ITourExecutionService
{
    Task<TourExecutionResponse> StartExecutionAsync(string touristId, string authHeader, Guid tourId, StartExecutionRequest request);
    Task<TourExecutionResponse> CompleteExecutionAsync(string touristId, Guid executionId);
    Task<TourExecutionResponse> AbandonExecutionAsync(string touristId, Guid executionId);
    Task<CheckPositionResponse> CheckPositionAsync(string touristId, Guid executionId, CheckPositionRequest request);
    Task<TourExecutionResponse?> GetActiveExecutionAsync(string touristId, Guid tourId);
}