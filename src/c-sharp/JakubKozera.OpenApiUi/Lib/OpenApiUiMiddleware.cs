using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Logging;
using System;
using System.IO;
using System.Reflection;

namespace JakubKozera.OpenApiUi
{
    public static class OpenApiUiMiddlewareExtensions
    {
        public static IApplicationBuilder UseOpenApiUi(this IApplicationBuilder app, string openApiSpecPath = "/swagger/v1/swagger.json")
        {
            var logger = app.ApplicationServices.GetRequiredService<ILoggerFactory>().CreateLogger("JakubKozera.OpenApiUi");

            logger.LogInformation("Initializing OpenAPI UI middleware with spec path: {OpenApiSpecPath}", openApiSpecPath); var assembly = Assembly.GetExecutingAssembly();
            var embeddedProvider = new EmbeddedFileProvider(assembly, "JakubKozera.OpenApiUi.openapi-ui");

            logger.LogDebug("Created embedded file provider for namespace: {Namespace}", "JakubKozera.OpenApiUi.openapi-ui");

            app.UseStaticFiles(new StaticFileOptions
            {
                FileProvider = embeddedProvider,
                RequestPath = "/openapi-ui",
                ServeUnknownFileTypes = true
            });

            logger.LogInformation("Configured static files middleware for OpenAPI UI assets at path: /openapi-ui");

            app.Use(async (context, next) =>
            {
                var requestPath = context.Request.Path.Value;
                logger.LogDebug("Processing request for path: {RequestPath}", requestPath);

                if (context.Request.Path == "/openapi-ui" || context.Request.Path == "/openapi-ui/")
                {
                    logger.LogInformation("OpenAPI UI page requested from: {RequestPath}, User-Agent: {UserAgent}",
                        requestPath, context.Request.Headers.UserAgent.ToString());

                    var fileInfo = embeddedProvider.GetFileInfo("index.html");

                    if (fileInfo.Exists)
                    {
                        logger.LogDebug("Found index.html file, size: {FileSize} bytes", fileInfo.Length);

                        try
                        {
                            using var stream = fileInfo.CreateReadStream();
                            using var reader = new StreamReader(stream);
                            var content = await reader.ReadToEndAsync();

                            logger.LogDebug("Successfully read index.html content, length: {ContentLength} characters", content.Length);

                            // Replace the placeholder with the actual OpenAPI spec path
                            var originalContent = content;
                            content = content.Replace("#swagger_path#", openApiSpecPath);

                            if (content != originalContent)
                            {
                                logger.LogDebug("Replaced #swagger_path# placeholder with: {OpenApiSpecPath}", openApiSpecPath);
                            }
                            else
                            {
                                logger.LogWarning("Placeholder #swagger_path# not found in index.html content");
                            }

                            content = content.Replace("bundle.css", "openapi-ui/bundle.css");
                            content = content.Replace("bundle.js", "openapi-ui/bundle.js");
                            content = content.Replace("openapi-ui.png", "openapi-ui/openapi-ui.png");

                            context.Response.ContentType = "text/html";
                            await context.Response.WriteAsync(content);

                            logger.LogInformation("Successfully served OpenAPI UI page to {RemoteIpAddress}",
                                context.Connection.RemoteIpAddress?.ToString() ?? "unknown");
                            return;
                        }
                        catch (Exception ex)
                        {
                            logger.LogError(ex, "Error reading or serving index.html file");
                            context.Response.StatusCode = 500;
                            await context.Response.WriteAsync("Internal server error while serving OpenAPI UI");
                            return;
                        }
                    }
                    else
                    {
                        logger.LogError("index.html file not found in embedded resources");
                        context.Response.StatusCode = 404;
                        await context.Response.WriteAsync("OpenAPI UI index.html not found");
                        return;
                    }
                }

                logger.LogDebug("Request path {RequestPath} does not match OpenAPI UI routes, continuing to next middleware", requestPath);
                await next();
            });

            logger.LogInformation("OpenAPI UI middleware initialization completed successfully");
            return app;
        }
    }
}
