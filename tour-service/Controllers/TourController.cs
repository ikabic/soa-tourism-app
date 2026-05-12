using Microsoft.AspNetCore.Mvc;
using TourService.DTOs;
using TourService.Services;

namespace TourService.Controllers;

[ApiController]
[Route("tours")]
public class TourController(ITourService tourService) : ControllerBase
{
    [HttpPost]
    public async Task<ActionResult<TourResponse>> CreateTour([FromBody] CreateTourRequest request)
    {
        var authorId = HttpContext.Items["userId"] as string;
        if (string.IsNullOrEmpty(authorId)) return Unauthorized();

        var tour = await tourService.CreateTourAsync(authorId, request);
        return CreatedAtAction(nameof(GetMyTours), new { }, tour);
    }

    [HttpGet("{tourId:guid}")]
    public async Task<ActionResult<TourResponse>> GetTour(Guid tourId)
    {
        var authorId = HttpContext.Items["userId"] as string;
        if (string.IsNullOrEmpty(authorId)) return Unauthorized();

        try
        {
            var tour = await tourService.GetTourAsync(authorId, tourId);
            return Ok(tour);
        }
        catch (KeyNotFoundException e) { return NotFound(e.Message); }
        catch (UnauthorizedAccessException) { return Forbid(); }
    }

    [HttpGet("my")]
    public async Task<ActionResult<List<TourResponse>>> GetMyTours()
    {
        var authorId = HttpContext.Items["userId"] as string;
        if (string.IsNullOrEmpty(authorId)) return Unauthorized();

        var tours = await tourService.GetMyToursAsync(authorId);
        return Ok(tours);
    }

    [HttpGet("published")]
    public async Task<ActionResult<List<PublishedTourResponse>>> GetPublishedTours()
    {
        var userId = HttpContext.Items["userId"] as string;
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var tours = await tourService.GetPublishedToursAsync();
        return Ok(tours);
    }

    [HttpPut("{tourId:guid}/publish")]
    public async Task<ActionResult<TourResponse>> PublishTour(Guid tourId)
    {
        var authorId = HttpContext.Items["userId"] as string;
        if (string.IsNullOrEmpty(authorId)) return Unauthorized();

        try
        {
            var tour = await tourService.PublishTourAsync(authorId, tourId);
            return Ok(tour);
        }
        catch (KeyNotFoundException e) { return NotFound(e.Message); }
        catch (UnauthorizedAccessException) { return Forbid(); }
        catch (InvalidOperationException e) { return BadRequest(e.Message); }
    }

    [HttpPut("{tourId:guid}/archive")]
    public async Task<ActionResult<TourResponse>> ArchiveTour(Guid tourId)
    {
        var authorId = HttpContext.Items["userId"] as string;
        if (string.IsNullOrEmpty(authorId)) return Unauthorized();

        try
        {
            var tour = await tourService.ArchiveTourAsync(authorId, tourId);
            return Ok(tour);
        }
        catch (KeyNotFoundException e) { return NotFound(e.Message); }
        catch (UnauthorizedAccessException) { return Forbid(); }
        catch (InvalidOperationException e) { return BadRequest(e.Message); }
    }

    [HttpPut("{tourId:guid}/activate")]
    public async Task<ActionResult<TourResponse>> ActivateTour(Guid tourId)
    {
        var authorId = HttpContext.Items["userId"] as string;
        if (string.IsNullOrEmpty(authorId)) return Unauthorized();

        try
        {
            var tour = await tourService.ActivateTourAsync(authorId, tourId);
            return Ok(tour);
        }
        catch (KeyNotFoundException e) { return NotFound(e.Message); }
        catch (UnauthorizedAccessException) { return Forbid(); }
        catch (InvalidOperationException e) { return BadRequest(e.Message); }
    }
}
