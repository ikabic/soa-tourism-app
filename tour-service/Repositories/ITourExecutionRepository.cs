using TourService.Models;

namespace TourService.Repositories;

public interface ITourExecutionRepository
{
    Task<TourExecution> CreateAsync(TourExecution execution);
    Task<TourExecution?> GetActiveByTouristAndTourAsync(string touristId, Guid tourId);
    Task<TourExecution?> GetByIdAsync(Guid id);
    Task UpdateAsync(TourExecution execution);
    Task<CompletedKeyPoint> AddCompletedKeyPointAsync(CompletedKeyPoint ckp);
    Task<bool> IsKeyPointCompletedAsync(Guid executionId, Guid keyPointId);
}