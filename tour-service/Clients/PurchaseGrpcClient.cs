using Grpc.Net.Client;
using TourService.Grpc;

namespace TourService.Clients;

public class PurchaseGrpcClient : IPurchaseClient
{
    private readonly PurchaseService.PurchaseServiceClient _client;

    public PurchaseGrpcClient()
    {
        var address = Environment.GetEnvironmentVariable("PURCHASE_GRPC_ADDR") ?? "http://purchase-app:50051";
        var channel = GrpcChannel.ForAddress(address, new GrpcChannelOptions
        {
            HttpHandler = new SocketsHttpHandler
            {
                EnableMultipleHttp2Connections = true
            }
        });
        _client = new PurchaseService.PurchaseServiceClient(channel);
    }

    public async Task<bool> HasPurchasedAsync(string userId, Guid tourId)
    {
        try
        {
            var response = await _client.HasPurchasedAsync(new HasPurchasedRequest
            {
                UserId = userId,
                TourId = tourId.ToString()
            });
            return response.Purchased;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[gRPC] HasPurchased failed: {ex.Message}");
            return false;
        }
    }
}
