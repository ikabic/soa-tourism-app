using Microsoft.AspNetCore.Mvc;
using TourService.DTOs;
using TourService.Services;

namespace TourService.Controllers;

[ApiController]
[Route("tours/{tourId:guid}/reviews")]
public class ReviewController(IReviewService reviewService) : ControllerBase
{
    [HttpPost]
    public async Task<ActionResult<ReviewResponse>> CreateReview(Guid tourId, [FromBody] CreateReviewRequest request)
    {
       var touristId = HttpContext.Items["userId"] as string;
       if (string.IsNullOrEmpty(touristId)) return Unauthorized();

       var role = HttpContext.Items["role"] as string;
       if (role?.ToUpper() != "TOURIST") return StatusCode(403, "Only tourists can leave reviews");

       try
       {
           var review = await reviewService.CreateReviewAsync(touristId, tourId, request);
           return CreatedAtAction(nameof(GetReviews), new { tourId }, review);
       }
        catch (KeyNotFoundException e) { return NotFound(e.Message); }
        catch (InvalidOperationException e) { return BadRequest(e.Message); }
    }

    [HttpGet]
    public async Task<ActionResult<List<ReviewResponse>>> GetReviews(Guid tourId)
    {
        var userId = HttpContext.Items["userId"] as string;
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var reviews = await reviewService.GetReviewsForTourAsync(tourId);
        return Ok(reviews);
    }
}