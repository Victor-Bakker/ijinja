using System.Globalization;
using System.Text;
using Ijinja.Web.Integrations.Commerce;
using Ijinja.Web.Integrations.Clickatell;
using Ijinja.Web.Integrations.Contracts;
using Ijinja.Web.Integrations.Shopify;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Options;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddMemoryCache();
builder.Services.Configure<CommerceOptions>(builder.Configuration.GetSection(CommerceOptions.SectionName));
builder.Services.Configure<ShopifyOptions>(builder.Configuration.GetSection(ShopifyOptions.SectionName));
builder.Services.Configure<ClickatellOptions>(builder.Configuration.GetSection(ClickatellOptions.SectionName));
builder.Services.AddHttpClient<IShopifyStoreService, ShopifyStoreService>(client =>
{
    client.Timeout = TimeSpan.FromSeconds(25);
});
builder.Services.AddHttpClient<IClickatellMessagingService, ClickatellMessagingService>(client =>
{
    client.Timeout = TimeSpan.FromSeconds(15);
});

var app = builder.Build();

var api = app.MapGroup("/api");

api.MapGet("/integrations/status", (
    IOptions<CommerceOptions> commerceOptions,
    IOptions<ShopifyOptions> shopifyOptions,
    IOptions<ClickatellOptions> clickatellOptions) =>
{
    var commerce = commerceOptions.Value;
    var shopify = shopifyOptions.Value;
    var clickatell = clickatellOptions.Value;

    return Results.Ok(new
    {
        enableShopifyCheckout = commerce.EnableShopifyCheckout,
        shopifyConfigured = shopify.IsConfigured,
        shopifyApiVersion = shopify.ApiVersion,
        clickatellConfigured = clickatell.IsConfigured,
        clickatellChannel = clickatell.Channel,
        clickatellMessagePath = clickatell.MessagePath,
    });
});

api.MapGet("/store/merch-products", async (
    IOptions<CommerceOptions> commerceOptions,
    IShopifyStoreService shopifyStoreService,
    CancellationToken cancellationToken) =>
{
    if (!commerceOptions.Value.EnableShopifyCheckout)
    {
        return Results.Problem(
            detail: "Shopify checkout is currently disabled by configuration.",
            title: "Shopify disabled",
            statusCode: StatusCodes.Status501NotImplemented);
    }

    try
    {
        var products = await shopifyStoreService.GetMerchProductsAsync(cancellationToken);
        return Results.Ok(products);
    }
    catch (InvalidOperationException exception)
    {
        return Results.Problem(
            detail: exception.Message,
            title: "Shopify not ready",
            statusCode: StatusCodes.Status503ServiceUnavailable);
    }
});

api.MapPost("/store/checkout", async (
    CheckoutCreateRequest request,
    IOptions<CommerceOptions> commerceOptions,
    IShopifyStoreService shopifyStoreService,
    CancellationToken cancellationToken) =>
{
    if (!commerceOptions.Value.EnableShopifyCheckout)
    {
        return Results.Problem(
            detail: "Shopify checkout is currently disabled by configuration.",
            title: "Shopify disabled",
            statusCode: StatusCodes.Status501NotImplemented);
    }

    if (request.Items.Count == 0)
    {
        return Results.BadRequest(new { error = "At least one checkout line item is required." });
    }

    try
    {
        var response = await shopifyStoreService.CreateCheckoutAsync(request, cancellationToken);
        if (response.Errors.Count > 0 && string.IsNullOrWhiteSpace(response.CheckoutUrl))
        {
            return Results.BadRequest(response);
        }

        return Results.Ok(response);
    }
    catch (InvalidOperationException exception)
    {
        return Results.Problem(
            detail: exception.Message,
            title: "Checkout could not be created",
            statusCode: StatusCodes.Status503ServiceUnavailable);
    }
});

api.MapPost("/store/manual-order", async (
    ManualOrderRequest request,
    IOptions<ClickatellOptions> clickatellOptions,
    IClickatellMessagingService clickatellMessagingService,
    CancellationToken cancellationToken) =>
{
    var missingFields = new List<string>();

    if (request.Items.Count == 0)
    {
        missingFields.Add("items");
    }

    if (string.IsNullOrWhiteSpace(request.FullName))
    {
        missingFields.Add("fullName");
    }

    if (string.IsNullOrWhiteSpace(request.Email))
    {
        missingFields.Add("email");
    }

    if (string.IsNullOrWhiteSpace(request.Phone))
    {
        missingFields.Add("phone");
    }

    if (string.IsNullOrWhiteSpace(request.Address))
    {
        missingFields.Add("address");
    }

    if (string.IsNullOrWhiteSpace(request.PaymentMethod))
    {
        missingFields.Add("paymentMethod");
    }

    if (missingFields.Count > 0)
    {
        return Results.BadRequest(new
        {
            error = $"Missing required fields: {string.Join(", ", missingFields)}."
        });
    }

    var clickatell = clickatellOptions.Value;
    if (!clickatell.IsConfigured || string.IsNullOrWhiteSpace(clickatell.SupportNumber))
    {
        return Results.Problem(
            detail: "Clickatell is not configured. Set Clickatell__ApiKey and Clickatell__SupportNumber.",
            title: "Messaging not configured",
            statusCode: StatusCodes.Status503ServiceUnavailable);
    }

    var orderReference = BuildManualOrderReference();
    var supportMessage = BuildManualOrderNotification(request, orderReference);
    var customerMessage = BuildManualOrderCustomerConfirmation(request, orderReference);

    var supportSendTask = clickatellMessagingService.SendTextMessageAsync(
        clickatell.SupportNumber,
        supportMessage,
        cancellationToken);

    var customerSendTask = clickatellMessagingService.SendTextMessageAsync(
        request.Phone.Trim(),
        customerMessage,
        cancellationToken);

    await Task.WhenAll(supportSendTask, customerSendTask);

    var supportSendResult = await supportSendTask;
    var customerSendResult = await customerSendTask;

    if (!supportSendResult.Accepted)
    {
        return Results.Problem(
            detail: supportSendResult.Error ?? "Clickatell rejected the support order notification.",
            title: "Order could not be submitted",
            statusCode: StatusCodes.Status502BadGateway);
    }

    if (!customerSendResult.Accepted)
    {
        return Results.Ok(new
        {
            status = "submitted_confirmation_failed",
            orderReference,
            supportNotificationMessageId = supportSendResult.ApiMessageId,
            customerConfirmationError = customerSendResult.Error ?? "Clickatell rejected customer confirmation message.",
        });
    }

    return Results.Ok(new
    {
        status = "submitted_and_confirmed",
        orderReference,
        supportNotificationMessageId = supportSendResult.ApiMessageId,
        customerConfirmationMessageId = customerSendResult.ApiMessageId,
    });
});

api.MapPost("/messaging/test", async (
    TestMessageRequest request,
    IClickatellMessagingService clickatellMessagingService,
    CancellationToken cancellationToken) =>
{
    if (string.IsNullOrWhiteSpace(request.To) || string.IsNullOrWhiteSpace(request.Message))
    {
        return Results.BadRequest(new { error = "`to` and `message` are required." });
    }

    var result = await clickatellMessagingService.SendTextMessageAsync(
        request.To,
        request.Message,
        cancellationToken);

    return result.Accepted
        ? Results.Ok(result)
        : Results.BadRequest(result);
});

api.MapPost("/webhooks/shopify/orders-paid", async (
    HttpRequest request,
    IMemoryCache cache,
    IOptions<CommerceOptions> commerceOptions,
    IOptions<ShopifyOptions> shopifyOptions,
    IOptions<ClickatellOptions> clickatellOptions,
    IClickatellMessagingService clickatellMessagingService,
    ILoggerFactory loggerFactory,
    CancellationToken cancellationToken) =>
{
    var logger = loggerFactory.CreateLogger("ShopifyOrdersPaidWebhook");
    var commerce = commerceOptions.Value;
    var options = shopifyOptions.Value;
    var clickatell = clickatellOptions.Value;

    if (!commerce.EnableShopifyCheckout)
    {
        logger.LogInformation("Ignored Shopify paid order webhook because Shopify checkout is disabled.");
        return Results.Ok(new { status = "ignored_shopify_disabled" });
    }

    if (string.IsNullOrWhiteSpace(options.WebhookSharedSecret))
    {
        logger.LogWarning("Received Shopify webhook, but Shopify__WebhookSharedSecret is not configured.");
        return Results.StatusCode(StatusCodes.Status503ServiceUnavailable);
    }

    var payload = await ReadBodyBytesAsync(request.Body, cancellationToken);
    var hmacHeader = request.Headers["X-Shopify-Hmac-Sha256"].ToString();
    if (!ShopifyWebhookValidator.IsValid(payload, hmacHeader, options.WebhookSharedSecret))
    {
        logger.LogWarning("Rejected Shopify webhook due to invalid HMAC signature.");
        return Results.Unauthorized();
    }

    var webhookId = request.Headers["X-Shopify-Webhook-Id"].ToString();
    if (!string.IsNullOrWhiteSpace(webhookId) && cache.TryGetValue(webhookId, out _))
    {
        return Results.Ok(new { status = "duplicate_ignored" });
    }

    if (!string.IsNullOrWhiteSpace(webhookId))
    {
        cache.Set(webhookId, true, TimeSpan.FromHours(6));
    }

    ShopifyOrderWebhookPayload orderPayload;
    try
    {
        orderPayload = ShopifyOrderWebhookPayload.Parse(payload);
    }
    catch (Exception exception)
    {
        logger.LogError(exception, "Failed to parse Shopify order webhook payload.");
        return Results.BadRequest(new { error = "Invalid webhook payload." });
    }

    if (!clickatell.IsConfigured)
    {
        logger.LogInformation(
            "Shopify order {OrderName} received; Clickatell is not configured, so no message was sent.",
            string.IsNullOrWhiteSpace(orderPayload.OrderName) ? orderPayload.OrderId : orderPayload.OrderName);

        return Results.Ok(new { status = "accepted_without_notification" });
    }

    var destination = clickatell.SupportNumber;
    if (string.IsNullOrWhiteSpace(destination))
    {
        logger.LogInformation(
            "Shopify order {OrderName} received; Clickatell support number is not configured.",
            string.IsNullOrWhiteSpace(orderPayload.OrderName) ? orderPayload.OrderId : orderPayload.OrderName);

        return Results.Ok(new { status = "accepted_without_destination" });
    }

    var message = BuildSupportNotification(orderPayload);
    var sendResult = await clickatellMessagingService.SendTextMessageAsync(
        destination,
        message,
        cancellationToken);

    return Results.Ok(new
    {
        status = sendResult.Accepted ? "accepted_and_notified" : "accepted_notification_failed",
        sendResult.ApiMessageId,
        sendResult.Error,
    });
});

api.MapPost("/webhooks/clickatell/status", async (
    HttpRequest request,
    ILoggerFactory loggerFactory,
    CancellationToken cancellationToken) =>
{
    var logger = loggerFactory.CreateLogger("ClickatellStatusWebhook");
    var body = await ReadBodyAsTextAsync(request.Body, cancellationToken);
    logger.LogInformation("Clickatell status callback payload: {Payload}", body);

    return Results.Ok(new { status = "received" });
});

api.MapPost("/webhooks/clickatell/reply", async (
    HttpRequest request,
    ILoggerFactory loggerFactory,
    CancellationToken cancellationToken) =>
{
    var logger = loggerFactory.CreateLogger("ClickatellReplyWebhook");
    var body = await ReadBodyAsTextAsync(request.Body, cancellationToken);
    logger.LogInformation("Clickatell reply callback payload: {Payload}", body);

    return Results.Ok(new { status = "received" });
});

var clientDistPath = Path.Combine(app.Environment.ContentRootPath, "ClientApp", "dist");

if (Directory.Exists(clientDistPath))
{
    var clientFiles = new PhysicalFileProvider(clientDistPath);

    app.UseDefaultFiles(new DefaultFilesOptions
    {
        FileProvider = clientFiles
    });

    app.UseStaticFiles(new StaticFileOptions
    {
        FileProvider = clientFiles
    });

    app.MapFallback(async context =>
    {
        context.Response.ContentType = "text/html; charset=utf-8";
        await context.Response.SendFileAsync(Path.Combine(clientDistPath, "index.html"));
    });
}
else
{
    app.MapGet("/", () => Results.Text(
        "Frontend build not found. In ClientApp, run `cmd /c npm install` once, then `cmd /c npm run build`.",
        "text/plain"));
}

app.Run();

static async Task<byte[]> ReadBodyBytesAsync(Stream body, CancellationToken cancellationToken)
{
    using var memoryStream = new MemoryStream();
    await body.CopyToAsync(memoryStream, cancellationToken);
    return memoryStream.ToArray();
}

static async Task<string> ReadBodyAsTextAsync(Stream body, CancellationToken cancellationToken)
{
    var bytes = await ReadBodyBytesAsync(body, cancellationToken);
    return Encoding.UTF8.GetString(bytes);
}

static string BuildSupportNotification(ShopifyOrderWebhookPayload orderPayload)
{
    var orderReference = string.IsNullOrWhiteSpace(orderPayload.OrderName)
        ? orderPayload.OrderId
        : orderPayload.OrderName;

    var totalText = !string.IsNullOrWhiteSpace(orderPayload.TotalPrice) &&
                    !string.IsNullOrWhiteSpace(orderPayload.CurrencyCode)
        ? $"{orderPayload.TotalPrice} {orderPayload.CurrencyCode}"
        : "unavailable";

    var customerPhone = string.IsNullOrWhiteSpace(orderPayload.CustomerPhone)
        ? "not provided"
        : orderPayload.CustomerPhone;

    return $"New paid Shopify order {orderReference}. Total: {totalText}. Customer: {orderPayload.CustomerName}. Phone: {customerPhone}.";
}

static string BuildManualOrderNotification(ManualOrderRequest order, string orderReference)
{
    var currencyCode = string.IsNullOrWhiteSpace(order.CurrencyCode) ? "ZAR" : order.CurrencyCode.Trim().ToUpperInvariant();
    var lines = new List<string>
    {
        $"New Ijinja manual merch order ({orderReference}):",
        "",
    };

    for (var index = 0; index < order.Items.Count; index += 1)
    {
        var item = order.Items[index];
        var productName = string.IsNullOrWhiteSpace(item.ProductName) ? item.ProductId : item.ProductName;
        var optionLabel = string.IsNullOrWhiteSpace(item.Option) ? "Standard" : item.Option;
        var lineTotal = item.LineTotal > 0m
            ? item.LineTotal.ToString("0.00", CultureInfo.InvariantCulture)
            : (item.UnitPrice * Math.Max(item.Quantity, 1)).ToString("0.00", CultureInfo.InvariantCulture);

        lines.Add($"{index + 1}. {productName} ({optionLabel}) x{Math.Max(item.Quantity, 1)} - {lineTotal} {currencyCode}");
    }

    lines.Add(string.Empty);
    lines.Add($"Order Reference: {orderReference}");
    lines.Add($"Order Total: {order.OrderTotal.ToString("0.00", CultureInfo.InvariantCulture)} {currencyCode}");
    lines.Add(string.Empty);
    lines.Add("Customer details:");
    lines.Add($"- Name: {order.FullName.Trim()}");
    lines.Add($"- Email: {order.Email.Trim()}");
    lines.Add($"- Phone: {order.Phone.Trim()}");
    lines.Add($"- Delivery address: {order.Address.Trim()}");
    lines.Add($"- Payment option: {order.PaymentMethod.Trim()}");

    if (!string.IsNullOrWhiteSpace(order.Notes))
    {
        lines.Add($"- Notes: {order.Notes.Trim()}");
    }

    lines.Add(string.Empty);
    lines.Add("Manual follow-up required: confirm stock, delivery fee, and payment instructions.");

    return string.Join('\n', lines);
}

static string BuildManualOrderCustomerConfirmation(ManualOrderRequest order, string orderReference)
{
    var currencyCode = string.IsNullOrWhiteSpace(order.CurrencyCode) ? "ZAR" : order.CurrencyCode.Trim().ToUpperInvariant();
    var lines = new List<string>
    {
        $"Hi {order.FullName.Trim()}, thanks for your Ijinja order.",
        $"Order Reference: {orderReference}",
        string.Empty,
        "Order summary:",
    };

    for (var index = 0; index < order.Items.Count; index += 1)
    {
        var item = order.Items[index];
        var productName = string.IsNullOrWhiteSpace(item.ProductName) ? item.ProductId : item.ProductName;
        var optionLabel = string.IsNullOrWhiteSpace(item.Option) ? "Standard" : item.Option;
        var lineTotal = item.LineTotal > 0m
            ? item.LineTotal.ToString("0.00", CultureInfo.InvariantCulture)
            : (item.UnitPrice * Math.Max(item.Quantity, 1)).ToString("0.00", CultureInfo.InvariantCulture);

        lines.Add($"{index + 1}. {productName} ({optionLabel}) x{Math.Max(item.Quantity, 1)} - {lineTotal} {currencyCode}");
    }

    lines.Add(string.Empty);
    lines.Add($"Order Total: {order.OrderTotal.ToString("0.00", CultureInfo.InvariantCulture)} {currencyCode}");
    lines.Add($"Payment option: {order.PaymentMethod.Trim()}");
    lines.Add(string.Empty);
    lines.Add("We received your order and will contact you shortly to confirm stock, delivery fee, and payment instructions.");

    return string.Join('\n', lines);
}

static string BuildManualOrderReference()
{
    return $"IJ-{DateTime.UtcNow:yyyyMMddHHmmss}-{Random.Shared.Next(100, 1000)}";
}

file sealed class TestMessageRequest
{
    public string To { get; init; } = string.Empty;
    public string Message { get; init; } = string.Empty;
}
