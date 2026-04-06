# Ijinja Frontend (React + Vite)

If VS Code crashes when running scripts, use **Command Prompt** (or prefix commands with `cmd /c` in PowerShell).

## 1) Run frontend only (fastest for UI work)

From `Ijinja.Web/ClientApp`:

```bash
cmd /c npm install
cmd /c npm run dev -- --host
```

Open: `http://localhost:5173`

## 2) Run full app through C# host (static build)

1. Build frontend:

```bash
cd ClientApp
cmd /c npm install
cmd /c npm run build
```

2. Run backend host:

```bash
cd ..
dotnet run
```

Open: `http://localhost:5294`

## 3) Publish production build (frontend + backend)

From `Ijinja.Web`:

```bash
dotnet publish -c Release -o .\publish
```

This publish flow now automatically:

- installs frontend dependencies (`npm ci`) if `ClientApp/node_modules` is missing
- runs `npm run build` in `ClientApp`
- includes `ClientApp/dist` in the publish output so the backend can serve the frontend

Deploy the contents of `Ijinja.Web/publish`.

## If VS Code still crashes

Run the same commands in an external terminal:

- `Windows Terminal` (Command Prompt tab), or
- classic `cmd.exe`

This project will run fine there even if the VS Code integrated terminal is unstable.

## Merch Store (No Database MVP)

The frontend now includes a basic merch store section with:

- static merch products
- in-browser cart (saved in `localStorage`)
- manual checkout submission to backend (`/api/store/manual-order`)

To customize it, edit `src/App.jsx`:

- `WHATSAPP_NUMBER` for contact links
- `merchProducts` for items, prices, options, and image paths

## Shopify + Clickatell Integration (Backend Foundation)

The backend now exposes starter integration endpoints under `/api`:

- `GET /api/integrations/status`
- `POST /api/store/manual-order` (current live flow: sends order details to your Clickatell support number)
- `GET /api/store/merch-products` (Shopify Storefront products via `MerchQuery`)
- `POST /api/store/checkout` (Shopify `cartCreate`, returns `checkoutUrl`)
- `POST /api/messaging/test` (send a test message through Clickatell)
- `POST /api/webhooks/shopify/orders-paid` (HMAC-validated Shopify webhook)
- `POST /api/webhooks/clickatell/status`
- `POST /api/webhooks/clickatell/reply`

### Configure secrets (recommended via environment variables)

Use these environment variable keys:

- `Commerce__EnableShopifyCheckout` (default `false`; keep `false` for Clickatell-only manual flow)
- `Shopify__StoreDomain`
- `Shopify__StorefrontAccessToken`
- `Shopify__ApiVersion` (default `2026-04`)
- `Shopify__MerchQuery` (default `tag:merch`)
- `Shopify__WebhookSharedSecret`
- `Clickatell__ApiKey`
- `Clickatell__AuthorizationScheme` (default `Bearer`)
- `Clickatell__BaseUrl` (default `https://platform.clickatell.com`)
- `Clickatell__MessagePath` (default `/v1/message`)
- `Clickatell__Channel` (default `whatsapp`)
- `Clickatell__IntegrationId` (optional)
- `Clickatell__From` (optional)
- `Clickatell__SupportNumber` (where order notifications are sent)

### Quick test flow

1. Run backend:

```bash
cd Ijinja.Web
dotnet run
```

2. Check integration status:

```bash
curl http://localhost:5294/api/integrations/status
```

3. Pull merch catalog from Shopify:

```bash
curl http://localhost:5294/api/store/merch-products
```

4. Submit a manual order (current mode):

```bash
curl -X POST http://localhost:5294/api/store/manual-order ^
  -H "Content-Type: application/json" ^
  -d "{\"fullName\":\"Test Customer\",\"email\":\"test@example.com\",\"phone\":\"+27820000000\",\"address\":\"123 Example Street\",\"paymentMethod\":\"EFT / Bank Transfer\",\"orderTotal\":299,\"currencyCode\":\"ZAR\",\"items\":[{\"productId\":\"ijinja-tee\",\"productName\":\"Ijinja Heritage Tee\",\"option\":\"M\",\"quantity\":1,\"unitPrice\":299,\"lineTotal\":299}]}"
```

5. Shopify checkout test (only when `Commerce__EnableShopifyCheckout=true`):

```bash
curl -X POST http://localhost:5294/api/store/checkout ^
  -H "Content-Type: application/json" ^
  -d "{\"items\":[{\"variantId\":\"gid://shopify/ProductVariant/1234567890\",\"quantity\":1}]}"
```
