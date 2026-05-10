using Microsoft.AspNetCore.Mvc;
using TourService.DTOs;
using TourService.Services;

namespace TourService.Controllers;

[ApiController]
[Route("tours/{tourId:guid}/keypoints")]
public class KeyPointController(ITourService tourService) : ControllerBase
{
    [HttpPost]
    public async Task<ActionResult<KeyPointResponse>> AddKeyPoint(
        Guid tourId,
        [FromBody] CreateKeyPointRequest request)
    {
        var authorId = HttpContext.Items["userId"] as string;
        if (string.IsNullOrEmpty(authorId)) return Unauthorized();

        try
        {
            var keyPoint = await tourService.AddKeyPointAsync(authorId, tourId, request);
            return CreatedAtAction(nameof(GetKeyPoints), new { tourId }, keyPoint);
        }
        catch (KeyNotFoundException e)
        {
            return NotFound(e.Message);
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
    }

    [HttpGet]
    public async Task<ActionResult<List<KeyPointResponse>>> GetKeyPoints(Guid tourId)
    {
        var authorId = HttpContext.Items["userId"] as string;
        if (string.IsNullOrEmpty(authorId)) return Unauthorized();

        try
        {
            var keyPoints = await tourService.GetKeyPointsAsync(authorId, tourId);
            return Ok(keyPoints);
        }
        catch (KeyNotFoundException e)
        {
            return NotFound(e.Message);
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
    }
}
