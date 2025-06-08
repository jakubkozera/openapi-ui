using Microsoft.AspNetCore.Mvc;
using System.Text;

namespace JakubKozera.OpenApiUi.Sample.Controllers;

/// <summary>
/// Controller for file operations
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class FileController : ControllerBase
{
    /// <summary>
    /// Uploads a file and returns its name and size
    /// </summary>
    /// <param name="file">The file to upload</param>
    /// <returns>File information including name and size</returns>
    /// <response code="200">Returns file information</response>
    /// <response code="400">No file provided or file is empty</response>
    [HttpPost("upload")]
    [ProducesResponseType<FileInfoResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status400BadRequest)]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> UploadFile(IFormFile file)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest(new ProblemDetails
            {
                Title = "Invalid file",
                Detail = "No file provided or file is empty",
                Status = StatusCodes.Status400BadRequest
            });
        }

        var fileInfo = new FileInfoResponse
        {
            FileName = file.FileName,
            Size = file.Length,
            ContentType = file.ContentType,
            UploadedAt = DateTime.UtcNow
        };

        return Ok(fileInfo);
    }

    /// <summary>
    /// Downloads a sample text file
    /// </summary>
    /// <param name="fileName">Optional custom filename for the downloaded file</param>
    /// <returns>A sample text file</returns>
    /// <response code="200">Returns the text file</response>
    [HttpGet("download")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [Produces("text/plain", "application/octet-stream")]
    public IActionResult DownloadFile([FromQuery] string? fileName = null)
    {
        // Create sample content in memory
        var content = $@"Sample Text File
Generated on: {DateTime.UtcNow:yyyy-MM-dd HH:mm:ss} UTC

This is a sample text file created in memory by the API.
It contains some basic information and sample data.

Random GUID: {Guid.NewGuid()}
Server Time: {DateTime.Now:F}

Thank you for using our file download API!";

        var bytes = Encoding.UTF8.GetBytes(content);
        var defaultFileName = fileName ?? $"sample-file-{DateTime.UtcNow:yyyyMMdd-HHmmss}.txt";

        return File(bytes, "text/plain", defaultFileName);
    }
}

/// <summary>
/// Response model for file upload information
/// </summary>
public class FileInfoResponse
{
    /// <summary>
    /// Original filename of the uploaded file
    /// </summary>
    public string FileName { get; set; } = string.Empty;

    /// <summary>
    /// Size of the file in bytes
    /// </summary>
    public long Size { get; set; }

    /// <summary>
    /// Content type of the uploaded file
    /// </summary>
    public string? ContentType { get; set; }

    /// <summary>
    /// Timestamp when the file was uploaded
    /// </summary>
    public DateTime UploadedAt { get; set; }
}
