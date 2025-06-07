using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using JakubKozera.OpenApiUi.Sample.Models;
using JakubKozera.OpenApiUi.Sample.Services;

namespace JakubKozera.OpenApiUi.Sample.Controllers;

/// <summary>
/// Controller for managing articles
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class ArticlesController : ControllerBase
{
    private readonly ArticleService _articleService;
    private readonly TokenService _tokenService;

    public ArticlesController(ArticleService articleService, TokenService tokenService)
    {
        _articleService = articleService;
        _tokenService = tokenService;
    }

    /// <summary>
    /// Gets a paginated list of published articles
    /// </summary>
    /// <param name="page">Page number (1-based)</param>
    /// <param name="pageSize">Number of items per page (1-100)</param>
    /// <param name="search">Search term to filter articles by title or content</param>
    /// <param name="tag">Filter by specific tag</param>
    /// <param name="authorLogin">Filter by author login</param>
    /// <returns>Paginated list of articles</returns>
    /// <response code="200">Returns paginated list of articles</response>
    /// <response code="400">Invalid pagination parameters</response>
    [HttpGet]
    [ProducesResponseType<PaginatedResponse<Article>>(StatusCodes.Status200OK)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status400BadRequest)]
    public IActionResult GetArticles(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? search = null,
        [FromQuery] string? tag = null,
        [FromQuery] string? authorLogin = null)
    {
        if (page < 1 || pageSize < 1 || pageSize > 100)
        {
            return BadRequest(new ProblemDetails
            {
                Title = "Invalid pagination parameters",
                Detail = "Page must be >= 1 and pageSize must be between 1 and 100",
                Status = 400
            });
        }

        var parameters = new PaginationParameters
        {
            Page = page,
            PageSize = pageSize,
            Search = search,
            Tag = tag,
            AuthorLogin = authorLogin
        };

        var result = _articleService.GetArticles(parameters);
        return Ok(result);
    }

    /// <summary>
    /// Gets a specific article by ID
    /// </summary>
    /// <param name="id">Article ID</param>
    /// <returns>Article details</returns>
    /// <response code="200">Returns the article</response>
    /// <response code="404">Article not found</response>
    [HttpGet("{id:int}")]
    [ProducesResponseType<Article>(StatusCodes.Status200OK)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound)]
    public IActionResult GetArticle(int id)
    {
        var article = _articleService.GetArticleById(id);
        if (article == null)
        {
            return NotFound(new ProblemDetails
            {
                Title = "Article not found",
                Detail = $"Article with ID {id} was not found or is not published",
                Status = 404
            });
        }

        return Ok(article);
    }

    /// <summary>
    /// Gets all unique tags from published articles
    /// </summary>
    /// <returns>List of unique tags</returns>
    /// <response code="200">Returns list of tags</response>
    [HttpGet("tags")]
    [ProducesResponseType<List<string>>(StatusCodes.Status200OK)]
    public IActionResult GetTags()
    {
        var tags = _articleService.GetAllTags();
        return Ok(tags);
    }

    /// <summary>
    /// Creates a new article (requires authentication)
    /// </summary>
    /// <param name="request">Article creation data</param>
    /// <returns>Created article</returns>
    /// <response code="201">Article created successfully</response>
    /// <response code="400">Invalid article data</response>
    /// <response code="401">Authentication required</response>
    [HttpPost]
    [ProducesResponseType<Article>(StatusCodes.Status201Created)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status401Unauthorized)]
    public IActionResult CreateArticle([FromBody] CreateArticleRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var userLogin = GetCurrentUserLogin();
        if (userLogin == null)
        {
            return Unauthorized(new ProblemDetails
            {
                Title = "Authentication required",
                Detail = "Please provide a valid Bearer token",
                Status = 401
            });
        }

        var article = _articleService.CreateArticle(request, userLogin);
        return CreatedAtAction(nameof(GetArticle), new { id = article.Id }, article);
    }

    /// <summary>
    /// Updates an existing article (requires authentication and ownership)
    /// </summary>
    /// <param name="id">Article ID</param>
    /// <param name="request">Article update data</param>
    /// <returns>Updated article</returns>
    /// <response code="200">Article updated successfully</response>
    /// <response code="400">Invalid article data</response>
    /// <response code="401">Authentication required</response>
    /// <response code="403">Not authorized to update this article</response>
    /// <response code="404">Article not found</response>
    [HttpPut("{id:int}")]
    [ProducesResponseType<Article>(StatusCodes.Status200OK)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status403Forbidden)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound)]
    public IActionResult UpdateArticle(int id, [FromBody] UpdateArticleRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var userLogin = GetCurrentUserLogin();
        if (userLogin == null)
        {
            return Unauthorized(new ProblemDetails
            {
                Title = "Authentication required",
                Detail = "Please provide a valid Bearer token",
                Status = 401
            });
        }

        var updatedArticle = _articleService.UpdateArticle(id, request, userLogin);
        if (updatedArticle == null)
        {
            // Check if article exists but user doesn't own it
            var existingArticle = _articleService.GetArticleById(id, incrementViewCount: false);
            if (existingArticle != null)
            {
                return Forbid("You can only update your own articles");
            }

            return NotFound(new ProblemDetails
            {
                Title = "Article not found",
                Detail = $"Article with ID {id} was not found",
                Status = 404
            });
        }

        return Ok(updatedArticle);
    }

    /// <summary>
    /// Deletes an article (requires authentication and ownership)
    /// </summary>
    /// <param name="id">Article ID</param>
    /// <returns>Success confirmation</returns>
    /// <response code="204">Article deleted successfully</response>
    /// <response code="401">Authentication required</response>
    /// <response code="403">Not authorized to delete this article</response>
    /// <response code="404">Article not found</response>
    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status403Forbidden)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound)]
    public IActionResult DeleteArticle(int id)
    {
        var userLogin = GetCurrentUserLogin();
        if (userLogin == null)
        {
            return Unauthorized(new ProblemDetails
            {
                Title = "Authentication required",
                Detail = "Please provide a valid Bearer token",
                Status = 401
            });
        }

        var deleted = _articleService.DeleteArticle(id, userLogin);
        if (!deleted)
        {
            // Check if article exists but user doesn't own it
            var existingArticle = _articleService.GetArticleById(id, incrementViewCount: false);
            if (existingArticle != null)
            {
                return Forbid("You can only delete your own articles");
            }

            return NotFound(new ProblemDetails
            {
                Title = "Article not found",
                Detail = $"Article with ID {id} was not found",
                Status = 404
            });
        }

        return NoContent();
    }

    /// <summary>
    /// Gets articles by the current authenticated user
    /// </summary>
    /// <returns>List of user's articles (including unpublished)</returns>
    /// <response code="200">Returns user's articles</response>
    /// <response code="401">Authentication required</response>
    [HttpGet("my")]
    [ProducesResponseType<List<Article>>(StatusCodes.Status200OK)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status401Unauthorized)]
    public IActionResult GetMyArticles()
    {
        var userLogin = GetCurrentUserLogin();
        if (userLogin == null)
        {
            return Unauthorized(new ProblemDetails
            {
                Title = "Authentication required",
                Detail = "Please provide a valid Bearer token",
                Status = 401
            });
        }

        var articles = _articleService.GetArticlesByAuthor(userLogin);
        return Ok(articles);
    }

    /// <summary>
    /// Extracts the current user's login from the JWT token
    /// </summary>
    /// <returns>User login if authenticated, null otherwise</returns>
    private string? GetCurrentUserLogin()
    {
        var authHeader = Request.Headers.Authorization.FirstOrDefault();
        if (authHeader == null || !authHeader.StartsWith("Bearer "))
        {
            return null;
        }

        var token = authHeader.Substring("Bearer ".Length).Trim();
        return _tokenService.ValidateToken(token);
    }
}
