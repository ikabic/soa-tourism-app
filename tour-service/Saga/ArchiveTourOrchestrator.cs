using NATS.Client;

namespace TourService.Saga;

public sealed class ArchiveTourOrchestrator : IArchiveTourOrchestrator, IDisposable
{
    private readonly INatsBus _bus;
    private readonly IArchiveTourHandler _handler;
    private readonly ILogger<ArchiveTourOrchestrator> _logger;

    private IAsyncSubscription? _commandSub;
    private IAsyncSubscription? _replySub;

    public ArchiveTourOrchestrator(INatsBus bus, IArchiveTourHandler handler, ILogger<ArchiveTourOrchestrator> logger)
    {
        _bus = bus;
        _handler = handler;
        _logger = logger;
    }

    public void Start()
    {
        _commandSub = _bus.SubscribeCommands(_handler.HandleAsync);
        _replySub = _bus.SubscribeReplies(HandleReplyAsync);
    }

    public void StartSaga(Guid tourId)
    {
        _logger.LogInformation("Starting ArchiveTour saga for {TourId}", tourId);
        _bus.PublishCommand(new ArchiveTourCommand(new TourDetails(tourId), ArchiveTourCommandType.ArchiveTour));
    }

    private Task HandleReplyAsync(ArchiveTourReply reply)
    {
        _logger.LogInformation("Saga reply {Type} for tour {Id}", reply.Type, reply.User.ID);

        switch (reply.Type)
        {
            case ArchiveTourReplyType.TourArchived:
                _bus.PublishCommand(new ArchiveTourCommand(reply.User, ArchiveTourCommandType.ClearTourFromCarts));
                break;

            case ArchiveTourReplyType.TourNotArchived:
                _logger.LogError("Could not archive tour {Id}, saga aborted", reply.User.ID);
                break;

            case ArchiveTourReplyType.TourFromCartsCleared:
                _bus.PublishCommand(new ArchiveTourCommand(reply.User, ArchiveTourCommandType.ConfirmArchive));
                break;

            case ArchiveTourReplyType.TourFromCartsNotCleared:
                _logger.LogWarning("Cart cleanup failed for {Id}, rolling back", reply.User.ID);
                _bus.PublishCommand(new ArchiveTourCommand(reply.User, ArchiveTourCommandType.RollbackTourArchiving));
                break;

            case ArchiveTourReplyType.ArchiveRolledBack:
                _bus.PublishCommand(new ArchiveTourCommand(reply.User, ArchiveTourCommandType.CancelArchive));
                break;

            case ArchiveTourReplyType.ArchiveNotRolledBack:
                _logger.LogCritical("Tour {Id}: archived but carts not cleared and rollback failed. Reattempting rollback.", reply.User.ID);
                _bus.PublishCommand(new ArchiveTourCommand(reply.User, ArchiveTourCommandType.RollbackTourArchiving));
                break;
        }

        return Task.CompletedTask;
    }

    public void Dispose()
    {
        _commandSub?.Unsubscribe();
        _replySub?.Unsubscribe();
    }
}