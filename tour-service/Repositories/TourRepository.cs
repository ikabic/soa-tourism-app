using Microsoft.EntityFrameworkCore;
using TourService.Data;
using TourService.Models;

namespace TourService.Repositories;

public class TourRepository(TourDbContext db) : ITourRepository
{
    public async Task<Tour> CreateAsync(Tour tour)
    {
        db.Tours.Add(tour);
        await db.SaveChangesAsync();
        return tour;
    }

    public async Task<List<Tour>> GetByAuthorIdAsync(string authorId)
    {
        return await db.Tours
            .Include(t => t.KeyPoints.OrderBy(k => k.Order))
            .Include(t => t.Durations)
            .Where(t => t.AuthorId == authorId)
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();
    }

    public async Task<Tour?> GetByIdAsync(Guid id)
    {
        return await db.Tours
            .Include(t => t.KeyPoints.OrderBy(k => k.Order))
            .Include(t => t.Durations)
            .FirstOrDefaultAsync(t => t.Id == id);
    }

    public async Task UpdateAsync(Tour tour)
    {
        db.Tours.Update(tour);
        await db.SaveChangesAsync();
    }
}
