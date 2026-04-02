using Microsoft.Extensions.FileProviders;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

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
