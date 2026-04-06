using System.Globalization;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using Ijinja.Web.Integrations.Contracts;
using Microsoft.Extensions.Options;

namespace Ijinja.Web.Integrations.Shopify;

public sealed class ShopifyStoreService(
    HttpClient httpClient,
    IOptions<ShopifyOptions> options,
    ILogger<ShopifyStoreService> logger) : IShopifyStoreService
{
    private readonly HttpClient _httpClient = httpClient;
    private readonly ShopifyOptions _options = options.Value;
    private readonly ILogger<ShopifyStoreService> _logger = logger;

    public async Task<IReadOnlyList<MerchProductDto>> GetMerchProductsAsync(CancellationToken cancellationToken)
    {
        EnsureConfigured();

        const string query = """
            query MerchProducts($first: Int!, $query: String!) {
              products(first: $first, query: $query) {
                edges {
                  node {
                    id
                    handle
                    title
                    description
                    featuredImage {
                      url
                      altText
                    }
                    variants(first: 50) {
                      edges {
                        node {
                          id
                          title
                          availableForSale
                          price {
                            amount
                            currencyCode
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
            """;

        var requestBody = new
        {
            query,
            variables = new
            {
                first = Math.Clamp(_options.MerchProductLimit, 1, 100),
                query = _options.MerchQuery,
            }
        };

        using var document = await ExecuteGraphQlAsync(requestBody, cancellationToken);

        var results = new List<MerchProductDto>();
        if (!TryGetPropertyChain(document.RootElement, out var productEdges, "data", "products", "edges") ||
            productEdges.ValueKind != JsonValueKind.Array)
        {
            return results;
        }

        foreach (var edge in productEdges.EnumerateArray())
        {
            if (!edge.TryGetProperty("node", out var node))
            {
                continue;
            }

            var variants = new List<MerchVariantDto>();
            if (TryGetPropertyChain(node, out var variantEdges, "variants", "edges") &&
                variantEdges.ValueKind == JsonValueKind.Array)
            {
                foreach (var variantEdge in variantEdges.EnumerateArray())
                {
                    if (!variantEdge.TryGetProperty("node", out var variantNode))
                    {
                        continue;
                    }

                    var price = 0m;
                    if (TryGetPropertyChain(variantNode, out var amountElement, "price", "amount"))
                    {
                        decimal.TryParse(
                            amountElement.GetString(),
                            NumberStyles.Number,
                            CultureInfo.InvariantCulture,
                            out price);
                    }

                    variants.Add(new MerchVariantDto
                    {
                        Id = GetString(variantNode, "id"),
                        Title = GetString(variantNode, "title", "Default Title"),
                        AvailableForSale = GetBool(variantNode, "availableForSale", false),
                        Price = price,
                        CurrencyCode = GetStringFromChain(variantNode, "ZAR", "price", "currencyCode"),
                    });
                }
            }

            var imageUrl = string.Empty;
            var imageAlt = string.Empty;
            if (node.TryGetProperty("featuredImage", out var featuredImage) &&
                featuredImage.ValueKind == JsonValueKind.Object)
            {
                imageUrl = GetString(featuredImage, "url");
                imageAlt = GetString(featuredImage, "altText");
            }

            results.Add(new MerchProductDto
            {
                Id = GetString(node, "id"),
                Handle = GetString(node, "handle"),
                Title = GetString(node, "title"),
                Description = GetString(node, "description"),
                ImageUrl = string.IsNullOrWhiteSpace(imageUrl) ? null : imageUrl,
                ImageAlt = string.IsNullOrWhiteSpace(imageAlt) ? null : imageAlt,
                Variants = variants,
            });
        }

        return results;
    }

    public async Task<CheckoutCreateResponse> CreateCheckoutAsync(
        CheckoutCreateRequest request,
        CancellationToken cancellationToken)
    {
        EnsureConfigured();

        const string mutation = """
            mutation CreateCart($input: CartInput!) {
              cartCreate(input: $input) {
                cart {
                  id
                  checkoutUrl
                }
                userErrors {
                  field
                  message
                }
              }
            }
            """;

        var lines = request.Items
            .Where(item => !string.IsNullOrWhiteSpace(item.VariantId))
            .Select(item => new
            {
                merchandiseId = item.VariantId,
                quantity = Math.Clamp(item.Quantity, 1, 999),
            })
            .ToArray();

        if (lines.Length == 0)
        {
            return new CheckoutCreateResponse
            {
                Errors = ["At least one valid line item is required."],
            };
        }

        var cartInput = new Dictionary<string, object?>
        {
            ["lines"] = lines,
        };

        if (!string.IsNullOrWhiteSpace(request.Note))
        {
            cartInput["note"] = request.Note.Trim();
        }

        var buyerIdentity = new Dictionary<string, string>();
        if (request.BuyerIdentity is not null)
        {
            if (!string.IsNullOrWhiteSpace(request.BuyerIdentity.Email))
            {
                buyerIdentity["email"] = request.BuyerIdentity.Email.Trim();
            }

            if (!string.IsNullOrWhiteSpace(request.BuyerIdentity.Phone))
            {
                buyerIdentity["phone"] = request.BuyerIdentity.Phone.Trim();
            }

            if (!string.IsNullOrWhiteSpace(request.BuyerIdentity.CountryCode))
            {
                buyerIdentity["countryCode"] = request.BuyerIdentity.CountryCode.Trim().ToUpperInvariant();
            }
        }

        if (buyerIdentity.Count > 0)
        {
            cartInput["buyerIdentity"] = buyerIdentity;
        }

        var requestBody = new
        {
            query = mutation,
            variables = new { input = cartInput },
        };

        using var document = await ExecuteGraphQlAsync(requestBody, cancellationToken);
        if (!TryGetPropertyChain(document.RootElement, out var cartCreate, "data", "cartCreate"))
        {
            return new CheckoutCreateResponse
            {
                Errors = ["Shopify did not return cart creation data."],
            };
        }

        var userErrors = new List<string>();
        if (cartCreate.TryGetProperty("userErrors", out var userErrorsElement) &&
            userErrorsElement.ValueKind == JsonValueKind.Array)
        {
            foreach (var userError in userErrorsElement.EnumerateArray())
            {
                var message = GetString(userError, "message");
                if (!string.IsNullOrWhiteSpace(message))
                {
                    userErrors.Add(message);
                }
            }
        }

        if (!cartCreate.TryGetProperty("cart", out var cart) || cart.ValueKind != JsonValueKind.Object)
        {
            return new CheckoutCreateResponse
            {
                Errors = userErrors.Count > 0 ? userErrors : ["Unable to create checkout cart."],
            };
        }

        return new CheckoutCreateResponse
        {
            CartId = GetString(cart, "id"),
            CheckoutUrl = GetString(cart, "checkoutUrl"),
            Errors = userErrors,
        };
    }

    private async Task<JsonDocument> ExecuteGraphQlAsync(object payload, CancellationToken cancellationToken)
    {
        using var request = new HttpRequestMessage(HttpMethod.Post, BuildGraphQlEndpoint());
        request.Headers.TryAddWithoutValidation("X-Shopify-Storefront-Access-Token", _options.StorefrontAccessToken);
        request.Content = JsonContent.Create(payload);

        using var response = await _httpClient.SendAsync(request, cancellationToken);
        var content = await response.Content.ReadAsStringAsync(cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            _logger.LogError(
                "Shopify API call failed with status {StatusCode}. Response: {ResponseBody}",
                response.StatusCode,
                content);

            throw new InvalidOperationException("Shopify request failed. Check credentials, domain, and API version.");
        }

        var document = JsonDocument.Parse(content);
        if (document.RootElement.TryGetProperty("errors", out var topLevelErrors) &&
            topLevelErrors.ValueKind == JsonValueKind.Array &&
            topLevelErrors.GetArrayLength() > 0)
        {
            var errors = topLevelErrors
                .EnumerateArray()
                .Select(error => error.TryGetProperty("message", out var message)
                    ? message.GetString()
                    : null)
                .Where(message => !string.IsNullOrWhiteSpace(message))
                .Cast<string>()
                .ToList();

            document.Dispose();
            throw new InvalidOperationException(
                errors.Count > 0
                    ? $"Shopify returned GraphQL errors: {string.Join("; ", errors)}"
                    : "Shopify returned GraphQL errors.");
        }

        return document;
    }

    private Uri BuildGraphQlEndpoint()
    {
        var storeDomain = _options.StoreDomain.Trim().TrimEnd('/');
        var apiVersion = string.IsNullOrWhiteSpace(_options.ApiVersion) ? "2026-04" : _options.ApiVersion.Trim();
        return new Uri($"https://{storeDomain}/api/{apiVersion}/graphql.json");
    }

    private void EnsureConfigured()
    {
        if (!_options.IsConfigured)
        {
            throw new InvalidOperationException(
                "Shopify is not configured. Set Shopify__StoreDomain and Shopify__StorefrontAccessToken.");
        }
    }

    private static bool TryGetPropertyChain(
        JsonElement root,
        out JsonElement value,
        params string[] path)
    {
        value = root;
        foreach (var segment in path)
        {
            if (value.ValueKind != JsonValueKind.Object || !value.TryGetProperty(segment, out value))
            {
                return false;
            }
        }

        return true;
    }

    private static string GetString(JsonElement element, string property, string fallback = "")
    {
        if (!element.TryGetProperty(property, out var value) || value.ValueKind == JsonValueKind.Null)
        {
            return fallback;
        }

        var text = value.GetString();
        return string.IsNullOrWhiteSpace(text) ? fallback : text;
    }

    private static bool GetBool(JsonElement element, string property, bool fallback)
    {
        if (!element.TryGetProperty(property, out var value))
        {
            return fallback;
        }

        return value.ValueKind == JsonValueKind.True || (value.ValueKind == JsonValueKind.False ? false : fallback);
    }

    private static string GetStringFromChain(JsonElement element, string fallback, params string[] path)
    {
        if (!TryGetPropertyChain(element, out var value, path) || value.ValueKind == JsonValueKind.Null)
        {
            return fallback;
        }

        var text = value.GetString();
        return string.IsNullOrWhiteSpace(text) ? fallback : text;
    }
}
