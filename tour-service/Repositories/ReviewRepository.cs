using Microsoft.EntityFrameworkCore;
using TourService.Data;
using TourService.Models;

namespace TourService.Repositories;

public class ReviewRepository(TourDbContext db) : IReviewRepository
{
    public async Task<Review> CreateAsync(Review review)
    {
        db.Reviews.Add(review);
        await db.SaveChangesAsync();
        return review;
    }

    public async Task<List<Review>> GetByTourIdAsync(Guid tourId) =>
        await db.Reviews.Where(r => r.TourId == tourId).OrderByDescending(r => r.CreatedAt).ToListAsync();

    public async Task<Review?> GetByIdAsync(Guid reviewId) =>
        await db.Reviews.FirstOrDefaultAsync(r => r.Id == reviewId);

    public async Task<bool> HasReviewedAsync(string touristId, Guid tourId) =>
        await db.Reviews.AnyAsync(r => r.TouristId == touristId && r.TourId == tourId);
}