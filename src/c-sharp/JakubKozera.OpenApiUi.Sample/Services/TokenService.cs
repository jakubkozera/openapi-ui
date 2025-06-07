using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using JakubKozera.OpenApiUi.Sample.Models;

namespace JakubKozera.OpenApiUi.Sample.Services;

/// <summary>
/// Service for handling JWT token operations
/// </summary>
public class TokenService
{
    private readonly string _secretKey;
    private readonly string _issuer;
    private readonly string _audience;
    private readonly int _expirationMinutes;

    public TokenService(IConfiguration configuration)
    {
        _secretKey = configuration["Jwt:SecretKey"] ?? "MyVeryLongSecretKeyForJWTTokenGeneration123456789";
        _issuer = configuration["Jwt:Issuer"] ?? "OpenApiSample";
        _audience = configuration["Jwt:Audience"] ?? "OpenApiSample";
        _expirationMinutes = int.Parse(configuration["Jwt:ExpirationMinutes"] ?? "60");
    }

    /// <summary>
    /// Generates a JWT token for the given user
    /// </summary>
    /// <param name="user">User to generate token for</param>
    /// <returns>Token response with JWT and expiration info</returns>
    public TokenResponse GenerateToken(User user)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_secretKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var expiresAt = DateTime.UtcNow.AddMinutes(_expirationMinutes);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.Login),
            new Claim(ClaimTypes.Email, user.Email ?? ""),
            new Claim("display_name", user.DisplayName ?? user.Login),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim(JwtRegisteredClaimNames.Iat,
                new DateTimeOffset(DateTime.UtcNow).ToUnixTimeSeconds().ToString(),
                ClaimValueTypes.Integer64)
        };

        var token = new JwtSecurityToken(
            issuer: _issuer,
            audience: _audience,
            claims: claims,
            expires: expiresAt,
            signingCredentials: credentials
        );

        var tokenString = new JwtSecurityTokenHandler().WriteToken(token);

        return new TokenResponse
        {
            Token = tokenString,
            ExpiresAt = expiresAt,
            UserLogin = user.Login
        };
    }

    /// <summary>
    /// Validates a JWT token and extracts user login
    /// </summary>
    /// <param name="token">JWT token to validate</param>
    /// <returns>User login if token is valid, null otherwise</returns>
    public string? ValidateToken(string token)
    {
        try
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_secretKey));
            var tokenHandler = new JwtSecurityTokenHandler();

            tokenHandler.ValidateToken(token, new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = key,
                ValidateIssuer = true,
                ValidIssuer = _issuer,
                ValidateAudience = true,
                ValidAudience = _audience,
                ValidateLifetime = true,
                ClockSkew = TimeSpan.Zero
            }, out SecurityToken validatedToken);

            var jwtToken = (JwtSecurityToken)validatedToken;
            var userLogin = jwtToken.Claims.First(x => x.Type == ClaimTypes.Name).Value;

            return userLogin;
        }
        catch
        {
            return null;
        }
    }
}
