namespace Ijinja.Web.Integrations.Contracts;

public sealed class MerchProductDto
{
    public string Id { get; init; } = string.Empty;
    public string Handle { get; init; } = string.Empty;
    public string Title { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public string? ImageUrl { get; init; }
    public string? ImageAlt { get; init; }
    public List<MerchVariantDto> Variants { get; init; } = [];
}

public sealed class MerchVariantDto
{
    public string Id { get; init; } = string.Empty;
    public string Title { get; init; } = string.Empty;
    public decimal Price { get; init; }
    public string CurrencyCode { get; init; } = "ZAR";
    public bool AvailableForSale { get; init; }
}

public sealed class CheckoutCreateRequest
{
    public List<CheckoutLineItemRequest> Items { get; init; } = [];
    public CheckoutBuyerIdentityRequest? BuyerIdentity { get; init; }
    public string? Note { get; init; }
}

public sealed class CheckoutLineItemRequest
{
    public string VariantId { get; init; } = string.Empty;
    public int Quantity { get; init; } = 1;
}

public sealed class CheckoutBuyerIdentityRequest
{
    public string? Email { get; init; }
    public string? Phone { get; init; }
    public string? CountryCode { get; init; }
}

public sealed class CheckoutCreateResponse
{
    public string CartId { get; init; } = string.Empty;
    public string CheckoutUrl { get; init; } = string.Empty;
    public List<string> Errors { get; init; } = [];
}

public sealed class ManualOrderRequest
{
    public string FullName { get; init; } = string.Empty;
    public string Email { get; init; } = string.Empty;
    public string Phone { get; init; } = string.Empty;
    public string Address { get; init; } = string.Empty;
    public string PaymentMethod { get; init; } = string.Empty;
    public string Notes { get; init; } = string.Empty;
    public decimal OrderTotal { get; init; }
    public string CurrencyCode { get; init; } = "ZAR";
    public List<ManualOrderLineItemRequest> Items { get; init; } = [];
}

public sealed class ManualOrderLineItemRequest
{
    public string ProductId { get; init; } = string.Empty;
    public string ProductName { get; init; } = string.Empty;
    public string Option { get; init; } = string.Empty;
    public int Quantity { get; init; } = 1;
    public decimal UnitPrice { get; init; }
    public decimal LineTotal { get; init; }
}
