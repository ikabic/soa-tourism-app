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

    [HttpGet("my")]
    public async Task<ActionResult<List<TourResponse>>> GetMyTours()
    {
        var authorId = HttpContext.Items["userId"] as string;
        if (string.IsNullOrEmpty(authorId)) return Unauthorized();

        var tours = await tourService.GetMyToursAsync(authorId);
        return Ok(tours);
    }
}
