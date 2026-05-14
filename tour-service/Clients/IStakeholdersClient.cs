namespace TourService.Clients;

public interface IStakeholdersClient
{
    Task<StakeholderUserInfo?> GetUserAsync(string userId);
}

public class StakeholderUserInfo
{
    public string UserId { get; set; } = null!;
    public string Username { get; set; } = null!;
    public string Email { get; set; } = null!;
}