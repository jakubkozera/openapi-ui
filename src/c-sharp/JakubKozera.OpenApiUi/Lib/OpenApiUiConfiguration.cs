namespace JakubKozera.OpenApiUi
{
    /// <summary>
    /// Configuration options for OpenAPI UI middleware.
    /// </summary>
    public class OpenApiUiConfiguration
    {
        /// <summary>
        /// Gets or sets the path to the OpenAPI specification JSON file.
        /// </summary>
        /// <value>The path to the OpenAPI specification. Defaults to "/swagger/v1/swagger.json".</value>
        public string OpenApiSpecPath { get; set; } = "/swagger/v1/swagger.json";

        /// <summary>
        /// Gets or sets the path where the OpenAPI UI will be served.
        /// </summary>
        /// <value>The UI path. Defaults to "openapi-ui".</value>
        public string OpenApiUiPath { get; set; } = "openapi-ui";
    }
}