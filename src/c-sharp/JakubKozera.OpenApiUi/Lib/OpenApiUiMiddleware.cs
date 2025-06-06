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
        /// <param name="configuration">The OpenAPI UI configuration options.</param>
        /// <returns>The application builder instance for method chaining.</returns>
        public static IApplicationBuilder UseOpenApiUi(this IApplicationBuilder app, OpenApiUiConfiguration configuration)
        {
            if (configuration == null)
                throw new ArgumentNullException(nameof(configuration));

            var assembly = Assembly.GetExecutingAssembly();
            var embeddedProvider = new EmbeddedFileProvider(assembly, "JakubKozera.OpenApiUi.openapi-ui");

            // Use the configurable UI path for serving static files
            var requestPath = $"/{configuration.OpenApiUiPath.TrimStart('/')}";

            app.UseStaticFiles(new StaticFileOptions
            {
                FileProvider = embeddedProvider,
                RequestPath = requestPath,
                ServeUnknownFileTypes = true
            });

            app.Use(async (context, next) =>
            {
                var currentPath = context.Request.Path.Value;

                if (context.Request.Path == requestPath || context.Request.Path == $"{requestPath}/")
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
                            content = content.Replace("#swagger_path#", configuration.OpenApiSpecPath);

                            // Update resource paths to use the configurable UI path
                            var uiPath = configuration.OpenApiUiPath.TrimStart('/');
                            content = content.Replace("bundle.css", $"{uiPath}/bundle.css");
                            content = content.Replace("bundle.js", $"{uiPath}/bundle.js");
                            content = content.Replace("openapi-ui.png", $"{uiPath}/openapi-ui.png");

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

        /// <summary>
        /// Adds OpenAPI UI middleware to the ASP.NET Core application pipeline with default configuration.
        /// This middleware serves an embedded OpenAPI documentation interface.
        /// </summary>
        /// <param name="app">The application builder instance.</param>
        /// <returns>The application builder instance for method chaining.</returns>
        public static IApplicationBuilder UseOpenApiUi(this IApplicationBuilder app)
            => UseOpenApiUi(app, new OpenApiUiConfiguration());
    }
}
