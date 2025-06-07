using JakubKozera.OpenApiUi.Sample.Models;

namespace JakubKozera.OpenApiUi.Sample.Services;

/// <summary>
/// In-memory data store for articles
/// </summary>
public class ArticleService
{
    private readonly List<Article> _articles = new()
    {
        new Article
        {
            Id = 1,
            Title = "Getting Started with ASP.NET Core",
            Content = "ASP.NET Core is a cross-platform, high-performance framework for building modern, cloud-based, Internet-connected applications. In this comprehensive guide, we'll explore the fundamentals of ASP.NET Core development, covering everything from setting up your development environment to deploying your first application. We'll discuss the modular architecture, dependency injection container, middleware pipeline, and the powerful features that make ASP.NET Core an excellent choice for web development.",
            Summary = "A comprehensive guide to getting started with ASP.NET Core development",
            Tags = new List<string> { "aspnet", "core", "tutorial", "beginner" },
            CreatedAt = DateTime.UtcNow.AddDays(-10),
            UpdatedAt = DateTime.UtcNow.AddDays(-10),
            AuthorLogin = "admin",
            IsPublished = true,
            ViewCount = 156
        },
        new Article
        {
            Id = 2,
            Title = "Advanced JWT Authentication in Web APIs",
            Content = "JSON Web Tokens (JWT) provide a secure way to transmit information between parties as a JSON object. This tutorial covers advanced JWT authentication patterns in ASP.NET Core Web APIs, including token refresh strategies, role-based authorization, custom claims, and security best practices. We'll implement a complete authentication system with proper error handling and security considerations for production environments.",
            Summary = "Deep dive into JWT authentication for secure web APIs",
            Tags = new List<string> { "jwt", "authentication", "security", "webapi" },
            CreatedAt = DateTime.UtcNow.AddDays(-7),
            UpdatedAt = DateTime.UtcNow.AddDays(-5),
            AuthorLogin = "john.doe",
            IsPublished = true,
            ViewCount = 89
        },
        new Article
        {
            Id = 3,
            Title = "Building Scalable Microservices with .NET",
            Content = "Microservices architecture has become increasingly popular for building large-scale applications. This article explores how to design and implement scalable microservices using .NET technologies. We'll cover service discovery, inter-service communication, data consistency patterns, containerization with Docker, and deployment strategies using Kubernetes. Learn how to break down monolithic applications into manageable, independently deployable services.",
            Summary = "Complete guide to microservices architecture with .NET",
            Tags = new List<string> { "microservices", "architecture", "docker", "kubernetes" },
            CreatedAt = DateTime.UtcNow.AddDays(-5),
            UpdatedAt = DateTime.UtcNow.AddDays(-3),
            AuthorLogin = "jane.smith",
            IsPublished = true,
            ViewCount = 234
        },
        new Article
        {
            Id = 4,
            Title = "OpenAPI Documentation Best Practices",
            Content = "OpenAPI (formerly Swagger) is the industry standard for describing REST APIs. This article covers best practices for creating comprehensive API documentation using OpenAPI specifications. We'll explore how to document complex request/response schemas, implement proper error handling documentation, use examples effectively, and integrate OpenAPI with your development workflow for better API design and testing.",
            Summary = "Best practices for creating excellent API documentation with OpenAPI",
            Tags = new List<string> { "openapi", "swagger", "documentation", "api" },
            CreatedAt = DateTime.UtcNow.AddDays(-3),
            UpdatedAt = DateTime.UtcNow.AddDays(-1),
            AuthorLogin = "admin",
            IsPublished = true,
            ViewCount = 67
        },
        new Article
        {
            Id = 5,
            Title = "Draft: Exploring Entity Framework Core 8",
            Content = "Entity Framework Core 8 introduces several exciting new features and performance improvements. This draft article explores the latest additions including JSON columns, bulk operations, temporal tables, and improved query performance. We'll also look at migration strategies from older versions and best practices for leveraging these new capabilities in production applications.",
            Summary = "Overview of new features in Entity Framework Core 8",
            Tags = new List<string> { "ef-core", "orm", "database", "draft" },
            CreatedAt = DateTime.UtcNow.AddDays(-1),
            UpdatedAt = DateTime.UtcNow,
            AuthorLogin = "john.doe",
            IsPublished = false,
            ViewCount = 12
        }
    };

    private int _nextId = 6;

    /// <summary>
    /// Gets all published articles with pagination and filtering
    /// </summary>
    /// <param name="parameters">Pagination and filter parameters</param>
    /// <returns>Paginated response with articles</returns>
    public PaginatedResponse<Article> GetArticles(PaginationParameters parameters)
    {
        var query = _articles.Where(a => a.IsPublished).AsQueryable();

        // Apply filters
        if (!string.IsNullOrWhiteSpace(parameters.Search))
        {
            var searchTerm = parameters.Search.ToLowerInvariant();
            query = query.Where(a =>
                a.Title.ToLowerInvariant().Contains(searchTerm) ||
                a.Content.ToLowerInvariant().Contains(searchTerm) ||
                (a.Summary != null && a.Summary.ToLowerInvariant().Contains(searchTerm)));
        }

        if (!string.IsNullOrWhiteSpace(parameters.Tag))
        {
            query = query.Where(a => a.Tags.Any(t =>
                t.Equals(parameters.Tag, StringComparison.OrdinalIgnoreCase)));
        }

        if (!string.IsNullOrWhiteSpace(parameters.AuthorLogin))
        {
            query = query.Where(a =>
                a.AuthorLogin.Equals(parameters.AuthorLogin, StringComparison.OrdinalIgnoreCase));
        }

        // Order by creation date (newest first)
        query = query.OrderByDescending(a => a.CreatedAt);

        var totalCount = query.Count();
        var totalPages = (int)Math.Ceiling((double)totalCount / parameters.PageSize);

        var items = query
            .Skip((parameters.Page - 1) * parameters.PageSize)
            .Take(parameters.PageSize)
            .ToList();

        return new PaginatedResponse<Article>
        {
            Items = items,
            TotalCount = totalCount,
            CurrentPage = parameters.Page,
            PageSize = parameters.PageSize,
            TotalPages = totalPages,
            HasNextPage = parameters.Page < totalPages,
            HasPreviousPage = parameters.Page > 1
        };
    }

    /// <summary>
    /// Gets a single article by ID
    /// </summary>
    /// <param name="id">Article ID</param>
    /// <param name="incrementViewCount">Whether to increment view count</param>
    /// <returns>Article if found and published, null otherwise</returns>
    public Article? GetArticleById(int id, bool incrementViewCount = true)
    {
        var article = _articles.FirstOrDefault(a => a.Id == id && a.IsPublished);

        if (article != null && incrementViewCount)
        {
            article.ViewCount++;
        }

        return article;
    }

    /// <summary>
    /// Gets articles by author (including unpublished ones)
    /// </summary>
    /// <param name="authorLogin">Author login</param>
    /// <returns>List of articles by the author</returns>
    public List<Article> GetArticlesByAuthor(string authorLogin)
    {
        return _articles
            .Where(a => a.AuthorLogin.Equals(authorLogin, StringComparison.OrdinalIgnoreCase))
            .OrderByDescending(a => a.CreatedAt)
            .ToList();
    }

    /// <summary>
    /// Creates a new article
    /// </summary>
    /// <param name="request">Article creation request</param>
    /// <param name="authorLogin">Login of the author</param>
    /// <returns>Created article</returns>
    public Article CreateArticle(CreateArticleRequest request, string authorLogin)
    {
        var article = new Article
        {
            Id = _nextId++,
            Title = request.Title,
            Content = request.Content,
            Summary = request.Summary,
            Tags = request.Tags ?? new List<string>(),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            AuthorLogin = authorLogin,
            IsPublished = request.IsPublished,
            ViewCount = 0
        };

        _articles.Add(article);
        return article;
    }

    /// <summary>
    /// Updates an existing article
    /// </summary>
    /// <param name="id">Article ID</param>
    /// <param name="request">Article update request</param>
    /// <param name="authorLogin">Login of the user attempting to update</param>
    /// <returns>Updated article if successful, null if not found or unauthorized</returns>
    public Article? UpdateArticle(int id, UpdateArticleRequest request, string authorLogin)
    {
        var article = _articles.FirstOrDefault(a => a.Id == id);

        if (article == null || !article.AuthorLogin.Equals(authorLogin, StringComparison.OrdinalIgnoreCase))
        {
            return null;
        }

        article.Title = request.Title;
        article.Content = request.Content;
        article.Summary = request.Summary;
        article.Tags = request.Tags ?? new List<string>();
        article.IsPublished = request.IsPublished;
        article.UpdatedAt = DateTime.UtcNow;

        return article;
    }

    /// <summary>
    /// Deletes an article
    /// </summary>
    /// <param name="id">Article ID</param>
    /// <param name="authorLogin">Login of the user attempting to delete</param>
    /// <returns>True if deleted successfully, false if not found or unauthorized</returns>
    public bool DeleteArticle(int id, string authorLogin)
    {
        var article = _articles.FirstOrDefault(a => a.Id == id);

        if (article == null || !article.AuthorLogin.Equals(authorLogin, StringComparison.OrdinalIgnoreCase))
        {
            return false;
        }

        _articles.Remove(article);
        return true;
    }

    /// <summary>
    /// Gets all unique tags from published articles
    /// </summary>
    /// <returns>List of unique tags</returns>
    public List<string> GetAllTags()
    {
        return _articles
            .Where(a => a.IsPublished)
            .SelectMany(a => a.Tags)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .OrderBy(t => t)
            .ToList();
    }
}
