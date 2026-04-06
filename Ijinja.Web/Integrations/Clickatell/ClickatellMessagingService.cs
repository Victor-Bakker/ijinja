using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.Extensions.Options;

namespace Ijinja.Web.Integrations.Clickatell;

public sealed class ClickatellMessagingService(
    HttpClient httpClient,
    IOptions<ClickatellOptions> options,
    ILogger<ClickatellMessagingService> logger) : IClickatellMessagingService
{
    private readonly HttpClient _httpClient = httpClient;
    private readonly ClickatellOptions _options = options.Value;
    private readonly ILogger<ClickatellMessagingService> _logger = logger;

    public async Task<ClickatellSendResult> SendTextMessageAsync(
        string to,
        string message,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(to) || string.IsNullOrWhiteSpace(message))
        {
            return new ClickatellSendResult
            {
                Accepted = false,
                Error = "A destination number and message text are required.",
            };
        }

        if (!_options.IsConfigured)
        {
            return new ClickatellSendResult
            {
                Accepted = false,
                Error = "Clickatell is not configured. Set Clickatell__ApiKey.",
            };
        }

        var messagePayload = new Dictionary<string, object?>
        {
            ["to"] = to.Trim(),
            ["content"] = message.Trim(),
            ["channel"] = _options.Channel,
        };

        if (!string.IsNullOrWhiteSpace(_options.IntegrationId))
        {
            messagePayload["integrationId"] = _options.IntegrationId;
        }

        if (!string.IsNullOrWhiteSpace(_options.From))
        {
            messagePayload["from"] = _options.From;
        }

        var requestBody = new Dictionary<string, object?>
        {
            ["messages"] = new[] { messagePayload }
        };

        using var request = new HttpRequestMessage(HttpMethod.Post, BuildMessageUri());
        request.Content = JsonContent.Create(requestBody);
        ApplyAuthorizationHeader(request);

        using var response = await _httpClient.SendAsync(request, cancellationToken);
        var content = await response.Content.ReadAsStringAsync(cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            _logger.LogError(
                "Clickatell message request failed with status {StatusCode}. Response: {ResponseBody}",
                response.StatusCode,
                content);

            return new ClickatellSendResult
            {
                Accepted = false,
                Error = $"Clickatell request failed ({(int)response.StatusCode}).",
            };
        }

        using var document = JsonDocument.Parse(content);
        if (!document.RootElement.TryGetProperty("messages", out var messages) ||
            messages.ValueKind != JsonValueKind.Array ||
            messages.GetArrayLength() == 0)
        {
            return new ClickatellSendResult
            {
                Accepted = false,
                Error = "Clickatell response did not include a message result.",
            };
        }

        var firstMessage = messages[0];
        var accepted = firstMessage.TryGetProperty("accepted", out var acceptedElement) &&
            acceptedElement.ValueKind == JsonValueKind.True;

        var apiMessageId = firstMessage.TryGetProperty("apiMessageId", out var idElement)
            ? idElement.GetString()
            : null;

        var error = firstMessage.TryGetProperty("error", out var errorElement)
            ? errorElement.GetString()
            : null;

        return new ClickatellSendResult
        {
            Accepted = accepted,
            ApiMessageId = apiMessageId,
            Error = error,
        };
    }

    private Uri BuildMessageUri()
    {
        var baseUrl = _options.BaseUrl.TrimEnd('/');
        var messagePath = _options.MessagePath.StartsWith('/')
            ? _options.MessagePath
            : $"/{_options.MessagePath}";

        return new Uri($"{baseUrl}{messagePath}");
    }

    private void ApplyAuthorizationHeader(HttpRequestMessage request)
    {
        if (string.IsNullOrWhiteSpace(_options.AuthorizationScheme))
        {
            request.Headers.TryAddWithoutValidation("Authorization", _options.ApiKey);
            return;
        }

        request.Headers.Authorization = new AuthenticationHeaderValue(
            _options.AuthorizationScheme.Trim(),
            _options.ApiKey.Trim());
    }
}
