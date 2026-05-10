using Microsoft.AspNetCore.Mvc;
using TourService.DTOs;
using TourService.Services;

namespace TourService.Controllers;

[ApiController]
[Route("tours/{tourId:guid}/durations")]
public class TourDurationController(ITourService tourService) : ControllerBase
{
    [HttpPost]
    public async Task<ActionResult<TourDurationResponse>> AddDuration(
        Guid tourId,
        [FromBody] CreateTourDurationRequest request)
    {
        var authorId = HttpContext.Items["userId"] as string;
        if (string.IsNullOrEmpty(authorId)) return Unauthorized();

        try
        {
            var duration = await tourService.AddDurationAsync(authorId, tourId, request);
            return CreatedAtAction(nameof(AddDuration), new { tourId }, duration);
        }
        catch (KeyNotFoundException e) { return NotFound(e.Message); }
        catch (UnauthorizedAccessException) { return Forbid(); }
    }
}
