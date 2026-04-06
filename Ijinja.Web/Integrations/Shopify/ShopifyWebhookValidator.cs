using System.Security.Cryptography;
using System.Text;

namespace Ijinja.Web.Integrations.Shopify;

public static class ShopifyWebhookValidator
{
    public static bool IsValid(byte[] payload, string? hmacHeader, string sharedSecret)
    {
        if (payload.Length == 0 ||
            string.IsNullOrWhiteSpace(hmacHeader) ||
            string.IsNullOrWhiteSpace(sharedSecret))
        {
            return false;
        }

        byte[] expectedSignature;
        try
        {
            expectedSignature = Convert.FromBase64String(hmacHeader);
        }
        catch (FormatException)
        {
            return false;
        }

        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(sharedSecret));
        var computedSignature = hmac.ComputeHash(payload);
        return CryptographicOperations.FixedTimeEquals(computedSignature, expectedSignature);
    }
}
