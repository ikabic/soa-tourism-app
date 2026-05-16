using NATS.Client;
using TourService.Models.Enums;
using TourService.Repositories;

namespace TourService.Saga;

public class ArchiveTourHandler : IArchiveTourHandler
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly INatsBus _bus;
    private readonly ILogger<ArchiveTourHandler> _logger;
    private IAsyncSubscription? _sub;

    public void StartListening()
    {
        _sub = _bus.SubscribeCommands(HandleAsync);
    }

    public ArchiveTourHandler(IServiceScopeFactory scopeFactory, INatsBus bus, ILogger<ArchiveTourHandler> logger)
    {
        _scopeFactory = scopeFactory;
        _bus = bus;
        _logger = logger;
    }

    public async Task HandleAsync(ArchiveTourCommand command)
    {
        switch (command.Type)
        {
            case ArchiveTourCommandType.ArchiveTour:
                await ArchiveAsync(command.Tour);
                break;

            case ArchiveTourCommandType.RollbackTourArchiving:
                await RollbackAsync(command.Tour);
                break;

            case ArchiveTourCommandType.ConfirmArchive:
                _logger.LogInformation("Saga confirmed for tour {Id}", command.Tour.ID);
                break;

            case ArchiveTourCommandType.CancelArchive:
                _logger.LogWarning("Saga cancelled for tour {Id}", command.Tour.ID);
                break;
        }
    }

    private async Task ArchiveAsync(TourDetails details)
    {
        using var scope = _scopeFactory.CreateScope();
        var repo = scope.ServiceProvider.GetRequiredService<ITourRepository>();

        try
        {
            var tour = await repo.GetByIdAsync(details.ID) ?? throw new KeyNotFoundException();

            tour.Status = TourStatus.Archived;
            tour.ArchivedAt = DateTime.UtcNow;
            await repo.UpdateAsync(tour);

            _bus.PublishReply(new ArchiveTourReply(details, ArchiveTourReplyType.TourArchived));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to archive tour {Id}", details.ID);
            _bus.PublishReply(new ArchiveTourReply(details, ArchiveTourReplyType.TourNotArchived));
        }
    }

    private async Task RollbackAsync(TourDetails details)
    {
        using var scope = _scopeFactory.CreateScope();
        var repo = scope.ServiceProvider.GetRequiredService<ITourRepository>();

        try
        {
            var tour = await repo.GetByIdAsync(details.ID);
            if (tour is null) return;

            tour.Status = TourStatus.Published;
            tour.ArchivedAt = null;
            await repo.UpdateAsync(tour);

            _bus.PublishReply(new ArchiveTourReply(details, ArchiveTourReplyType.ArchiveRolledBack));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Rollback failed for tour {Id}", details.ID);
            _bus.PublishReply(new ArchiveTourReply(details, ArchiveTourReplyType.ArchiveNotRolledBack));
        }
    }
}
