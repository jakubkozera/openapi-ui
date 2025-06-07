using System.ComponentModel.DataAnnotations;

namespace JakubKozera.OpenApiUi.Sample.Models;

/// <summary>
/// Represents a user in the system
/// </summary>
public class User
{
    /// <summary>
    /// Unique identifier of the user
    /// </summary>
    public int Id { get; set; }

    /// <summary>
    /// User login
    /// </summary>
    [Required]
    [StringLength(50, MinimumLength = 3)]
    public required string Login { get; set; }

    /// <summary>
    /// User password (in real app should be hashed)
    /// </summary>
    [Required]
    [StringLength(100, MinimumLength = 6)]
    public required string Password { get; set; }

    /// <summary>
    /// User email address
    /// </summary>
    [EmailAddress]
    public string? Email { get; set; }

    /// <summary>
    /// User display name
    /// </summary>
    [StringLength(100)]
    public string? DisplayName { get; set; }

    /// <summary>
    /// Date when user was created
    /// </summary>
    public DateTime CreatedAt { get; set; }

    /// <summary>
    /// Whether the user account is active
    /// </summary>
    public bool IsActive { get; set; } = true;
}
