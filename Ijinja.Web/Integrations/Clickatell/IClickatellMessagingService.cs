namespace Ijinja.Web.Integrations.Clickatell;

public interface IClickatellMessagingService
{
    Task<ClickatellSendResult> SendTextMessageAsync(string to, string message, CancellationToken cancellationToken);
}

public sealed class ClickatellSendResult
{
    public bool Accepted { get; init; }
    public string? ApiMessageId { get; init; }
    public string? Error { get; init; }
}
