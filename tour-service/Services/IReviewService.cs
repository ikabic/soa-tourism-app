using TourService.DTOs;

namespace TourService.Services;

public interface IReviewService
{
    Task<ReviewResponse> CreateReviewAsync(string touristId, Guid tourId, CreateReviewRequest request);
    Task<List<ReviewResponse>> GetReviewsForTourAsync(Guid tourId);
}