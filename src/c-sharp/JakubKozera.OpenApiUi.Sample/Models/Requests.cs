using System.ComponentModel.DataAnnotations;

namespace JakubKozera.OpenApiUi.Sample.Models;

/// <summary>
/// Request model for user login
/// </summary>
/// <example>
/// {
///   "login": "admin",
///   "password": "admin123"
/// }
/// </example>
public class LoginRequest
{
    /// <summary>
    /// User login
    /// </summary>
    /// <example>admin</example>
    [Required]
    public required string Login { get; set; }

    /// <summary>
    /// User password
    /// </summary>
    /// <example>admin123</example>
    [Required]
    public required string Password { get; set; }
}

/// <summary>
/// Response model containing authentication token
/// </summary>
public class TokenResponse
{
    /// <summary>
    /// JWT access token
    /// </summary>
    public required string Token { get; set; }

    /// <summary>
    /// Token expiration date
    /// </summary>
    public DateTime ExpiresAt { get; set; }

    /// <summary>
    /// User login
    /// </summary>
    public required string UserLogin { get; set; }
}

/// <summary>
/// Request model for creating a new article
/// </summary>
public class CreateArticleRequest
{
    /// <summary>
    /// Title of the article
    /// </summary>
    [Required]
    [StringLength(200, MinimumLength = 5)]
    public required string Title { get; set; }

    /// <summary>
    /// Content of the article
    /// </summary>
    [Required]
    [StringLength(5000, MinimumLength = 10)]
    public required string Content { get; set; }

    /// <summary>
    /// Short summary of the article
    /// </summary>
    [StringLength(500)]
    public string? Summary { get; set; }

    /// <summary>
    /// Tags associated with the article
    /// </summary>
    public List<string> Tags { get; set; } = new();

    /// <summary>
    /// Whether the article should be published immediately
    /// </summary>
    public bool IsPublished { get; set; } = true;
}

/// <summary>
/// Request model for updating an existing article
/// </summary>
public class UpdateArticleRequest
{
    /// <summary>
    /// Updated title of the article
    /// </summary>
    [Required]
    [StringLength(200, MinimumLength = 5)]
    public required string Title { get; set; }

    /// <summary>
    /// Updated content of the article
    /// </summary>
    [Required]
    [StringLength(5000, MinimumLength = 10)]
    public required string Content { get; set; }

    /// <summary>
    /// Updated summary of the article
    /// </summary>
    [StringLength(500)]
    public string? Summary { get; set; }

    /// <summary>
    /// Updated tags associated with the article
    /// </summary>
    public List<string> Tags { get; set; } = new();

    /// <summary>
    /// Whether the article should be published
    /// </summary>
    public bool IsPublished { get; set; }
}

/// <summary>
/// Pagination parameters for listing articles
/// </summary>
public class PaginationParameters
{
    /// <summary>
    /// Page number (1-based)
    /// </summary>
    [Range(1, int.MaxValue)]
    public int Page { get; set; } = 1;

    /// <summary>
    /// Number of items per page
    /// </summary>
    [Range(1, 100)]
    public int PageSize { get; set; } = 10;

    /// <summary>
    /// Search term to filter articles by title or content
    /// </summary>
    public string? Search { get; set; }

    /// <summary>
    /// Filter by tag
    /// </summary>
    public string? Tag { get; set; }

    /// <summary>
    /// Filter by author login
    /// </summary>
    public string? AuthorLogin { get; set; }
}

/// <summary>
/// Paginated response containing list of articles
/// </summary>
public class PaginatedResponse<T>
{
    /// <summary>
    /// List of items for current page
    /// </summary>
    public required List<T> Items { get; set; }

    /// <summary>
    /// Total number of items across all pages
    /// </summary>
    public int TotalCount { get; set; }

    /// <summary>
    /// Current page number
    /// </summary>
    public int CurrentPage { get; set; }

    /// <summary>
    /// Number of items per page
    /// </summary>
    public int PageSize { get; set; }

    /// <summary>
    /// Total number of pages
    /// </summary>
    public int TotalPages { get; set; }

    /// <summary>
    /// Whether there is a next page
    /// </summary>
    public bool HasNextPage { get; set; }

    /// <summary>
    /// Whether there is a previous page
    /// </summary>
    public bool HasPreviousPage { get; set; }
}
