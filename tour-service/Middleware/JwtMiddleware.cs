using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

namespace TourService.Middleware;

public class JwtMiddleware(RequestDelegate next)
{
    public async Task InvokeAsync(HttpContext context)
    {
        var authHeader = context.Request.Headers.Authorization.FirstOrDefault();
        if (authHeader != null && authHeader.StartsWith("Bearer "))
        {
            var token = authHeader["Bearer ".Length..];
            var secret = Environment.GetEnvironmentVariable("JWT_SECRET") ?? "default_secret";

            try
            {
                var parts = token.Split('.');
                if (parts.Length != 3)
                    throw new Exception("Invalid JWT format");

                var signingInput = $"{parts[0]}.{parts[1]}";
                using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(secret));
                var expectedSig = hmac.ComputeHash(Encoding.UTF8.GetBytes(signingInput));
                var actualSig = Convert.FromBase64String(Base64UrlToBase64(parts[2]));

                if (!CryptographicOperations.FixedTimeEquals(expectedSig, actualSig))
                    throw new Exception("Invalid signature");

                var payloadJson = Encoding.UTF8.GetString(Convert.FromBase64String(Base64UrlToBase64(parts[1])));
                var payload = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(payloadJson)!;

                if (payload.TryGetValue("exp", out var expEl) &&
                    DateTimeOffset.UtcNow.ToUnixTimeSeconds() > expEl.GetInt64())
                    throw new Exception("Token expired");

                context.Items["userId"] = payload.TryGetValue("userId", out var uid) ? uid.GetString() : null;
                context.Items["role"] = payload.TryGetValue("role", out var role) ? role.GetString() : null;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[JWT] Validation failed: {ex.Message}");
            }
        }

        await next(context);
    }

    private static string Base64UrlToBase64(string base64Url)
    {
        var base64 = base64Url.Replace('-', '+').Replace('_', '/');
        return (base64.Length % 4) switch
        {
            2 => base64 + "==",
            3 => base64 + "=",
            _ => base64
        };
    }
}
