namespace TourService.Clients;

public interface IPurchaseClient
{
    Task<bool> HasPurchasedAsync(string token, Guid tourId);
}
