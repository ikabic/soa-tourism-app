using System.Net.Http;
using System.Net.Http.Headers;
using System.Text.Json;

namespace TourService.Clients;

public class PurchaseClient : IPurchaseClient
{
    private readonly HttpClient _httpClient;

    public PurchaseClient(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public async Task<bool> HasPurchasedAsync(string token, Guid tourId)
    {
        var request = new HttpRequestMessage(HttpMethod.Get, $"/status/{tourId}");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token.Replace("Bearer ", ""));

        var response = await _httpClient.SendAsync(request);
        if (!response.IsSuccessStatusCode)
        {
            return false;
        }

        using var stream = await response.Content.ReadAsStreamAsync();
        var result = await JsonSerializer.DeserializeAsync<PurchaseStatusResponse>(stream, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true,
        });

        return result?.Purchased ?? false;
    }

    private sealed class PurchaseStatusResponse
    {
        public bool Purchased { get; set; }
    }
}
