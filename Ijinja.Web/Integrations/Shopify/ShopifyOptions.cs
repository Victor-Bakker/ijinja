namespace Ijinja.Web.Integrations.Shopify;

public sealed class ShopifyOptions
{
    public const string SectionName = "Shopify";

    public string StoreDomain { get; init; } = string.Empty;
    public string StorefrontAccessToken { get; init; } = string.Empty;
    public string ApiVersion { get; init; } = "2026-04";
    public string MerchQuery { get; init; } = "tag:merch";
    public int MerchProductLimit { get; init; } = 20;
    public string WebhookSharedSecret { get; init; } = string.Empty;

    public bool IsConfigured =>
        !string.IsNullOrWhiteSpace(StoreDomain) &&
        !string.IsNullOrWhiteSpace(StorefrontAccessToken);
}
