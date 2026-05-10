using TourService.Models;

namespace TourService.Repositories;

public interface ITourRepository
{
    Task<Tour> CreateAsync(Tour tour);
    Task<List<Tour>> GetByAuthorIdAsync(string authorId);
    Task<Tour?> GetByIdAsync(Guid id);
    Task UpdateAsync(Tour tour);
    Task<KeyPoint> AddKeyPointAsync(KeyPoint keyPoint);
    Task<List<KeyPoint>> GetKeyPointsByTourIdAsync(Guid tourId);
    Task<TourDuration> AddDurationAsync(TourDuration duration);
    Task<List<Tour>> GetPublishedToursAsync();
}
