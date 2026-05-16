namespace TourService.Saga;

public interface IArchiveTourOrchestrator
{
    void StartSaga(Guid tourId);
}