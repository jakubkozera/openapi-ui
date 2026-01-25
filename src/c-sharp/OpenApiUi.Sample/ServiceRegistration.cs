// This file exists to help with namespace resolution during compilation
using OpenApiUi.Sample.Services;

namespace OpenApiUi.Sample;

public static class ServiceRegistration
{
    public static void AddCustomServices(this IServiceCollection services)
    {
        services.AddSingleton<UserService>();
        services.AddSingleton<ArticleService>();
        services.AddSingleton<TokenService>();
    }
}
