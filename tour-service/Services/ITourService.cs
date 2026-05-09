using TourService.DTOs;

namespace TourService.Services;

public interface ITourService
{
    Task<TourResponse> CreateTourAsync(string authorId, CreateTourRequest request);
    Task<List<TourResponse>> GetMyToursAsync(string authorId);
}
