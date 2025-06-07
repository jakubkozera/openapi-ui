using JakubKozera.OpenApiUi.Sample.Models;

namespace JakubKozera.OpenApiUi.Sample.Services;

/// <summary>
/// In-memory data store for users
/// </summary>
public class UserService
{
    private readonly List<User> _users = new()
    {
        new User
        {
            Id = 1,
            Login = "admin",
            Password = "admin123", // In real app this should be hashed
            Email = "admin@example.com",
            DisplayName = "Administrator",
            CreatedAt = DateTime.UtcNow.AddDays(-30),
            IsActive = true
        },
        new User
        {
            Id = 2,
            Login = "john.doe",
            Password = "password123",
            Email = "john.doe@example.com",
            DisplayName = "John Doe",
            CreatedAt = DateTime.UtcNow.AddDays(-15),
            IsActive = true
        },
        new User
        {
            Id = 3,
            Login = "jane.smith",
            Password = "secret456",
            Email = "jane.smith@example.com",
            DisplayName = "Jane Smith",
            CreatedAt = DateTime.UtcNow.AddDays(-7),
            IsActive = true
        }
    };

    /// <summary>
    /// Validates user credentials
    /// </summary>
    /// <param name="login">User login</param>
    /// <param name="password">User password</param>
    /// <returns>User if valid credentials, null otherwise</returns>
    public User? ValidateUser(string login, string password)
    {
        return _users.FirstOrDefault(u =>
            u.Login.Equals(login, StringComparison.OrdinalIgnoreCase) &&
            u.Password == password &&
            u.IsActive);
    }

    /// <summary>
    /// Gets user by login
    /// </summary>
    /// <param name="login">User login</param>
    /// <returns>User if found, null otherwise</returns>
    public User? GetUserByLogin(string login)
    {
        return _users.FirstOrDefault(u =>
            u.Login.Equals(login, StringComparison.OrdinalIgnoreCase) &&
            u.IsActive);
    }

    /// <summary>
    /// Gets all users
    /// </summary>
    /// <returns>List of all users</returns>
    public List<User> GetAllUsers()
    {
        return _users.Where(u => u.IsActive).ToList();
    }
}
