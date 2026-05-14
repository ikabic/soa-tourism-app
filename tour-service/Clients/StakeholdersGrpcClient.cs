using Grpc.Net.Client;
using TourService.Grpc;

namespace TourService.Clients;

public class StakeholdersGrpcClient : IStakeholdersClient
{
    private readonly UserService.UserServiceClient _client;

    public StakeholdersGrpcClient(IConfiguration configuration)
    {
        var address = Environment.GetEnvironmentVariable("STAKEHOLDERS_GRPC_ADDR")  ?? "http://stakeholders-app:50051";
        var channel = GrpcChannel.ForAddress(address, new GrpcChannelOptions
        {
            HttpHandler = new SocketsHttpHandler
            {
                EnableMultipleHttp2Connections = true
            }
        });
        _client = new UserService.UserServiceClient(channel);
    }

    public async Task<StakeholderUserInfo?> GetUserAsync(string userId)
    {
        try
        {
            var response = await _client.GetUserAsync(new GetUserRequest { UserId = userId });
            if (!response.Exists) return null;
            return new StakeholderUserInfo
            {
                UserId = response.UserId,
                Username = response.Username,
                Email = response.Email
            };
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[gRPC] GetUser failed: {ex.Message}");
            return null;
        }
    }
}