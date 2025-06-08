using Microsoft.AspNetCore.Mvc;
using JakubKozera.OpenApiUi.Sample.Models;
using JakubKozera.OpenApiUi.Sample.Services;

namespace JakubKozera.OpenApiUi.Sample.Controllers;

/// <summary>
/// Authentication controller for user login and token management
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class AuthController : ControllerBase
{
    private readonly UserService _userService;
    private readonly TokenService _tokenService;

    public AuthController(UserService userService, TokenService tokenService)
    {
        _userService = userService;
        _tokenService = tokenService;
    }

    /// <summary>
    /// Authenticates a user and returns a JWT token
    /// </summary>
    /// <param name="request">Login credentials</param>
    /// <returns>JWT token if credentials are valid</returns>
    /// <remarks>
    /// Sample login credentials for testing:
    /// 
    /// **Administrator:**
    /// - Login: admin
    /// - Password: admin123
    /// 
    /// **Regular Users:**
    /// - Login: john.doe, Password: password123
    /// - Login: jane.smith, Password: secret456
    /// 
    /// </remarks>
    /// <response code="200">Login successful, returns JWT token</response>
    /// <response code="400">Invalid request format</response>
    /// <response code="401">Invalid credentials</response>
    [HttpPost("login")]
    [ProducesResponseType<TokenResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status401Unauthorized)]
    public IActionResult Login([FromBody] LoginRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var user = _userService.ValidateUser(request.Login, request.Password);
        if (user == null)
        {
            return Unauthorized(new ProblemDetails
            {
                Title = "Authentication failed",
                Detail = "Invalid login credentials",
                Status = 401
            });
        }

        var tokenResponse = _tokenService.GenerateToken(user);
        return Ok(tokenResponse);
    }

    /// <summary>
    /// Gets information about the currently authenticated user
    /// </summary>
    /// <returns>Current user information</returns>
    /// <response code="200">Returns current user information</response>
    /// <response code="401">User is not authenticated</response>
    [HttpGet("me")]
    [ProducesResponseType<object>(StatusCodes.Status200OK)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status401Unauthorized)]
    public IActionResult GetCurrentUser()
    {
        var authHeader = Request.Headers.Authorization.FirstOrDefault();
        if (authHeader == null || !authHeader.StartsWith("Bearer "))
        {
            return Unauthorized(new ProblemDetails
            {
                Title = "Authentication required",
                Detail = "Please provide a valid Bearer token",
                Status = 401
            });
        }

        var token = authHeader.Substring("Bearer ".Length).Trim();
        var userLogin = _tokenService.ValidateToken(token);

        if (userLogin == null)
        {
            return Unauthorized(new ProblemDetails
            {
                Title = "Invalid token",
                Detail = "The provided token is invalid or expired",
                Status = 401
            });
        }

        var user = _userService.GetUserByLogin(userLogin);
        if (user == null)
        {
            return Unauthorized(new ProblemDetails
            {
                Title = "User not found",
                Detail = "The user associated with this token no longer exists",
                Status = 401
            });
        }

        return Ok(new
        {
            Id = user.Id,
            Login = user.Login,
            Email = user.Email,
            DisplayName = user.DisplayName,
            CreatedAt = user.CreatedAt
        });
    }
}
