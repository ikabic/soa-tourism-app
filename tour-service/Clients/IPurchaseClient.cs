namespace TourService.Clients;

public interface IPurchaseClient
{
    Task<bool> HasPurchasedAsync(string userId, Guid tourId);
}
