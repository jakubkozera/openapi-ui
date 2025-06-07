using JakubKozera.OpenApiUi;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Reflection;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();

// Add Swashbuckle services for XML documentation support
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Articles API",
        Version = "v1",
        Description = "A sample API for managing articles with JWT authentication"
    });
    // Include XML comments
    var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    if (File.Exists(xmlPath))
    {
        c.IncludeXmlComments(xmlPath);
    }

    // Add JWT Bearer authentication
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        Description = "Enter your JWT token in the format: Bearer {your_token}"
    });
});

// Register custom services - using direct instantiation as workaround
builder.Services.AddSingleton(new JakubKozera.OpenApiUi.Sample.Services.UserService());
builder.Services.AddSingleton(new JakubKozera.OpenApiUi.Sample.Services.ArticleService());
builder.Services.AddSingleton(provider => new JakubKozera.OpenApiUi.Sample.Services.TokenService(provider.GetRequiredService<IConfiguration>()));

// Configure JWT Authentication
var jwtSettings = builder.Configuration.GetSection("Jwt");
var secretKey = jwtSettings["SecretKey"] ?? "MyVeryLongSecretKeyForJWTTokenGeneration123456789";

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings["Issuer"] ?? "OpenApiSample",
            ValidAudience = jwtSettings["Audience"] ?? "OpenApiSample",
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),
            ClockSkew = TimeSpan.Zero
        };
    });

builder.Services.AddAuthorization();

// Add CORS for GitHub Pages
builder.Services.AddCors(options =>
{
    options.AddPolicy("GitHubPages", policy =>
    {
        policy.WithOrigins("https://jakubkozera.github.io")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

var app = builder.Build();

// Enable CORS
app.UseCors("GitHubPages");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();


app.UseSwagger();


app.UseOpenApiUi();

// for reference 
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Articles API v1");
});

app.Run();

