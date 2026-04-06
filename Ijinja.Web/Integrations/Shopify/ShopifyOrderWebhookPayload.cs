using System.Text.Json;

namespace Ijinja.Web.Integrations.Shopify;

public sealed record ShopifyOrderWebhookPayload(
    string OrderId,
    string OrderName,
    string CustomerName,
    string? CustomerPhone,
    string? TotalPrice,
    string? CurrencyCode)
{
    public static ShopifyOrderWebhookPayload Parse(byte[] payload)
    {
        using var document = JsonDocument.Parse(payload);
        var root = document.RootElement;

        var orderId = GetString(root, "id");
        var orderName = GetString(root, "name");
        var totalPrice = GetString(root, "current_total_price");
        var currencyCode = GetString(root, "currency");

        var customerName = "Customer";
        var customerPhone = string.Empty;

        if (TryGetObject(root, "customer", out var customer))
        {
            var firstName = GetString(customer, "first_name");
            var lastName = GetString(customer, "last_name");
            var combinedName = $"{firstName} {lastName}".Trim();
            if (!string.IsNullOrWhiteSpace(combinedName))
            {
                customerName = combinedName;
            }

            customerPhone = GetString(customer, "phone");
        }

        if (string.IsNullOrWhiteSpace(customerPhone) &&
            TryGetObject(root, "shipping_address", out var shippingAddress))
        {
            customerPhone = GetString(shippingAddress, "phone");
        }

        if (string.IsNullOrWhiteSpace(customerPhone) &&
            TryGetObject(root, "billing_address", out var billingAddress))
        {
            customerPhone = GetString(billingAddress, "phone");
        }

        return new ShopifyOrderWebhookPayload(
            OrderId: orderId,
            OrderName: orderName,
            CustomerName: customerName,
            CustomerPhone: string.IsNullOrWhiteSpace(customerPhone) ? null : customerPhone,
            TotalPrice: string.IsNullOrWhiteSpace(totalPrice) ? null : totalPrice,
            CurrencyCode: string.IsNullOrWhiteSpace(currencyCode) ? null : currencyCode);
    }

    private static string GetString(JsonElement element, string propertyName)
    {
        if (!element.TryGetProperty(propertyName, out var value) || value.ValueKind == JsonValueKind.Null)
        {
            return string.Empty;
        }

        return value.GetString() ?? string.Empty;
    }

    private static bool TryGetObject(JsonElement element, string propertyName, out JsonElement value)
    {
        if (element.TryGetProperty(propertyName, out value) && value.ValueKind == JsonValueKind.Object)
        {
            return true;
        }

        value = default;
        return false;
    }
}
