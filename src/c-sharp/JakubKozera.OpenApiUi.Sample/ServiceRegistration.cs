// This file exists to help with namespace resolution during compilation
using JakubKozera.OpenApiUi.Sample.Services;

namespace JakubKozera.OpenApiUi.Sample;

public static class ServiceRegistration
{
    public static void AddCustomServices(this IServiceCollection services)
    {
        services.AddSingleton<UserService>();
        services.AddSingleton<ArticleService>();
        services.AddSingleton<TokenService>();
    }
}
