using System.ComponentModel.DataAnnotations;

namespace JakubKozera.OpenApiUi.Sample.Models;

/// <summary>
/// Represents an article in the system
/// </summary>
public class Article
{
    /// <summary>
    /// Unique identifier of the article
    /// </summary>
    public int Id { get; set; }

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
    /// Short description/summary of the article
    /// </summary>
    [StringLength(500)]
    public string? Summary { get; set; }

    /// <summary>
    /// Tags associated with the article
    /// </summary>
    public List<string> Tags { get; set; } = new();

    /// <summary>
    /// Creation date of the article
    /// </summary>
    public DateTime CreatedAt { get; set; }

    /// <summary>
    /// Last modification date
    /// </summary>
    public DateTime UpdatedAt { get; set; }

    /// <summary>
    /// Login of the article author
    /// </summary>
    [Required]
    public required string AuthorLogin { get; set; }

    /// <summary>
    /// Whether the article is published
    /// </summary>
    public bool IsPublished { get; set; }

    /// <summary>
    /// Number of article views
    /// </summary>
    public int ViewCount { get; set; }
}
