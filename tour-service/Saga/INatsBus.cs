using NATS.Client;

namespace TourService.Saga;

public interface INatsBus
{
    void PublishCommand(ArchiveTourCommand command);
    void PublishReply(ArchiveTourReply reply);
    IAsyncSubscription SubscribeCommands(Func<ArchiveTourCommand, Task> handler);
    IAsyncSubscription SubscribeReplies(Func<ArchiveTourReply, Task> handler);
}