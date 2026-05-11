using TourService.DTOs;

namespace TourService.Services;

public interface ITourService
{
    Task<TourResponse> CreateTourAsync(string authorId, CreateTourRequest request);
    Task<List<TourResponse>> GetMyToursAsync(string authorId);
    Task<KeyPointResponse> AddKeyPointAsync(string authorId, Guid tourId, CreateKeyPointRequest request);
    Task<List<KeyPointResponse>> GetKeyPointsAsync(string authorId, Guid tourId);
    Task<TourDurationResponse> AddDurationAsync(string authorId, Guid tourId, CreateTourDurationRequest request);
    Task<TourResponse> PublishTourAsync(string authorId, Guid tourId);
    Task<TourResponse> ArchiveTourAsync(string authorId, Guid tourId);
    Task<TourResponse> ActivateTourAsync(string authorId, Guid tourId);
    Task<List<PublishedTourResponse>> GetPublishedToursAsync();
    Task<KeyPointResponse> UpdateKeyPointAsync(string authorId, Guid tourId, Guid keyPointId, UpdateKeyPointResponse request);
    Task DeleteKeyPointAsync(string authorId, Guid tourId, Guid keyPointId);
}
