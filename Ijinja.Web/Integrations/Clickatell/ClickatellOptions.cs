namespace Ijinja.Web.Integrations.Clickatell;

public sealed class ClickatellOptions
{
    public const string SectionName = "Clickatell";

    public string BaseUrl { get; init; } = "https://platform.clickatell.com";
    public string MessagePath { get; init; } = "/v1/message";
    public string AuthorizationScheme { get; init; } = "Bearer";
    public string ApiKey { get; init; } = string.Empty;
    public string Channel { get; init; } = "whatsapp";
    public string IntegrationId { get; init; } = string.Empty;
    public string From { get; init; } = string.Empty;
    public string SupportNumber { get; init; } = string.Empty;

    public bool IsConfigured => !string.IsNullOrWhiteSpace(ApiKey);
}
