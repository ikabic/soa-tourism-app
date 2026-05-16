using NATS.Client;
using System.Text.Json;

namespace TourService.Saga;

public sealed class NatsBus : INatsBus, IDisposable
{
    private readonly IConnection _conn;

    public const string CommandSubject = "archive_tour.command";
    public const string ReplySubject = "archive_tour.reply";
    public const string QueueGroup = "tours";

    public NatsBus(string host, string port, string user, string password)
    {
        var opts = ConnectionFactory.GetDefaultOptions();
        opts.Url = $"nats://{user}:{password}@{host}:{port}";

        _conn = new ConnectionFactory().CreateConnection(opts);
    }

    public void PublishCommand(ArchiveTourCommand command) => _conn.Publish(CommandSubject, JsonSerializer.SerializeToUtf8Bytes(command));

    public void PublishReply(ArchiveTourReply reply) => _conn.Publish(ReplySubject, JsonSerializer.SerializeToUtf8Bytes(reply));

    public IAsyncSubscription SubscribeCommands(Func<ArchiveTourCommand, Task> handler) =>
        _conn.SubscribeAsync(CommandSubject, QueueGroup, async (_, args) =>
        {
            var cmd = JsonSerializer.Deserialize<ArchiveTourCommand>(args.Message.Data);
            if (cmd is not null) await handler(cmd);
        });

    public IAsyncSubscription SubscribeReplies(Func<ArchiveTourReply, Task> handler) =>
        _conn.SubscribeAsync(ReplySubject, QueueGroup, async (_, args) =>
        {
            var reply = JsonSerializer.Deserialize<ArchiveTourReply>(args.Message.Data);
            if (reply is not null) await handler(reply);
        });

    public void Dispose() => _conn.Dispose();
}