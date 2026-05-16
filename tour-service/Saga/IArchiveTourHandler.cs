namespace TourService.Saga;

public interface IArchiveTourHandler
{
    Task HandleAsync(ArchiveTourCommand command);
    void StartListening();
}