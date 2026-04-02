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

## If VS Code still crashes

Run the same commands in an external terminal:

- `Windows Terminal` (Command Prompt tab), or
- classic `cmd.exe`

This project will run fine there even if the VS Code integrated terminal is unstable.

## Merch Store (No Database MVP)

The frontend now includes a basic merch store section with:

- static merch products
- in-browser cart (saved in `localStorage`)
- WhatsApp checkout message generation

To customize it, edit `src/App.jsx`:

- `WHATSAPP_NUMBER` for checkout destination
- `merchProducts` for items, prices, options, and image paths
