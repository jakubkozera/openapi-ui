using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.FileProviders;
using System;
using System.IO;
using System.Reflection;

namespace JakubKozera.OpenApiUi
{
    /// <summary>
    /// Extension methods for configuring OpenAPI UI middleware in ASP.NET Core applications.
    /// </summary>
    public static class OpenApiUiMiddlewareExtensions
    {
        /// <summary>
        /// Adds OpenAPI UI middleware to the ASP.NET Core application pipeline.
        /// This middleware serves an embedded OpenAPI documentation interface.
        /// </summary>
        /// <param name="app">The application builder instance.</param>
        /// <param name="openApiSpecPath">The path to the OpenAPI specification JSON file. Defaults to "/swagger/v1/swagger.json".</param>
        /// <returns>The application builder instance for method chaining.</returns>
        public static IApplicationBuilder UseOpenApiUi(this IApplicationBuilder app, string openApiSpecPath = "/swagger/v1/swagger.json")
        {
            var assembly = Assembly.GetExecutingAssembly(); var embeddedProvider = new EmbeddedFileProvider(assembly, "JakubKozera.OpenApiUi.openapi-ui");

            app.UseStaticFiles(new StaticFileOptions
            {
                FileProvider = embeddedProvider,
                RequestPath = "/openapi-ui",
                ServeUnknownFileTypes = true
            });

            app.Use(async (context, next) =>
            {
                var requestPath = context.Request.Path.Value;

                if (context.Request.Path == "/openapi-ui" || context.Request.Path == "/openapi-ui/")
                {
                    var fileInfo = embeddedProvider.GetFileInfo("index.html");

                    if (fileInfo.Exists)
                    {
                        try
                        {
                            using var stream = fileInfo.CreateReadStream();
                            using var reader = new StreamReader(stream);
                            var content = await reader.ReadToEndAsync();

                            // Replace the placeholder with the actual OpenAPI spec path
                            var originalContent = content;
                            content = content.Replace("#swagger_path#", openApiSpecPath);

                            content = content.Replace("bundle.css", "openapi-ui/bundle.css");
                            content = content.Replace("bundle.js", "openapi-ui/bundle.js");
                            content = content.Replace("openapi-ui.png", "openapi-ui/openapi-ui.png");

                            context.Response.ContentType = "text/html";
                            await context.Response.WriteAsync(content);

                            return;
                        }
                        catch (Exception)
                        {
                            context.Response.StatusCode = 500;
                            await context.Response.WriteAsync("Internal server error while serving OpenAPI UI");
                            return;
                        }
                    }
                    else
                    {
                        context.Response.StatusCode = 404;
                        await context.Response.WriteAsync("OpenAPI UI index.html not found");
                        return;
                    }
                }

                await next();
            });

            return app;
        }
    }
}
