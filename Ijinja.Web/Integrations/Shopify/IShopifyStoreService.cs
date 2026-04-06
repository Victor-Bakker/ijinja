using Ijinja.Web.Integrations.Contracts;

namespace Ijinja.Web.Integrations.Shopify;

public interface IShopifyStoreService
{
    Task<IReadOnlyList<MerchProductDto>> GetMerchProductsAsync(CancellationToken cancellationToken);
    Task<CheckoutCreateResponse> CreateCheckoutAsync(CheckoutCreateRequest request, CancellationToken cancellationToken);
}
