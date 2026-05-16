using Microsoft.EntityFrameworkCore;
using TourService.Data;
using TourService.Models;

namespace TourService.Repositories;

public class TourExecutionRepository(TourDbContext db) : ITourExecutionRepository
{
    public async Task<TourExecution> CreateAsync(TourExecution execution)
    {
        db.TourExecutions.Add(execution);
        await db.SaveChangesAsync();
        return execution;
    }

    public async Task<TourExecution?> GetActiveByTouristAndTourAsync(string touristId, Guid tourId) =>
        await db.TourExecutions.Include(e => e.CompletedKeyPoints).FirstOrDefaultAsync(e => e.TouristId == touristId && e.TourId == tourId && e.Status == Models.Enums.TourExecutionStatus.Active);

    public async Task<TourExecution?> GetByIdAsync(Guid id) =>
        await db.TourExecutions.Include(e => e.CompletedKeyPoints).FirstOrDefaultAsync(e => e.Id == id);

    public async Task UpdateAsync(TourExecution execution)
    {
        db.TourExecutions.Update(execution);
        await db.SaveChangesAsync();
    }

    public async Task<CompletedKeyPoint> AddCompletedKeyPointAsync(CompletedKeyPoint ckp)
    {
        db.CompletedKeyPoints.Add(ckp);
        await db.SaveChangesAsync();
        return ckp;
    }

    public async Task<bool> IsKeyPointCompletedAsync(Guid executionId, Guid keyPointId) =>
        await db.CompletedKeyPoints.AnyAsync(c => c.TourExecutionId == executionId && c.KeyPointId == keyPointId);
}