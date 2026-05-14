using TourService.Models;

namespace TourService.Repositories;

public interface IReviewRepository
{
    Task<Review> CreateAsync(Review review);
    Task<List<Review>> GetByTourIdAsync(Guid tourId);
    Task<Review?> GetByIdAsync(Guid reviewId);
    Task<bool> HasReviewedAsync(string touristId, Guid tourId);
}