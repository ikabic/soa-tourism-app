using Microsoft.AspNetCore.Mvc;
using TourService.DTOs;
using TourService.Services;

namespace TourService.Controllers;

[ApiController]
[Route("tours/{tourId:guid}/executions")]
public class TourExecutionController(ITourExecutionService executionService) : ControllerBase
{
    [HttpPost("start")]
    public async Task<ActionResult<TourExecutionResponse>> Start(Guid tourId, [FromBody] StartExecutionRequest request)
    {
        var touristId = HttpContext.Items["userId"] as string;
        if (string.IsNullOrEmpty(touristId)) return Unauthorized();

        var role = HttpContext.Items["role"] as string;
        if (role?.ToLower() != "tourist") return StatusCode(403, "Only tourists can start tours");

        var authHeader = Request.Headers["Authorization"].ToString();

        try
        {
            var execution = await executionService.StartExecutionAsync(touristId, authHeader, tourId, request);
            return Ok(execution);
        }
        catch (KeyNotFoundException e) { return NotFound(e.Message); }
        catch (InvalidOperationException e) { return BadRequest(e.Message); }
    }

    [HttpGet("active")]
    public async Task<ActionResult<TourExecutionResponse>> GetActive(Guid tourId)
    {
        var touristId = HttpContext.Items["userId"] as string;
        if (string.IsNullOrEmpty(touristId)) return Unauthorized();

        var execution = await executionService.GetActiveExecutionAsync(touristId, tourId);
        if (execution == null) return NotFound("No active execution");
        return Ok(execution);
    }

    [HttpPost("{executionId:guid}/check-position")]
    public async Task<ActionResult<CheckPositionResponse>> CheckPosition(Guid tourId, Guid executionId, [FromBody] CheckPositionRequest request)
    {
        var touristId = HttpContext.Items["userId"] as string;
        if (string.IsNullOrEmpty(touristId)) return Unauthorized();

        try
        {
            var result = await executionService.CheckPositionAsync(touristId, executionId, request);
            return Ok(result);
        }
        catch (KeyNotFoundException e) { return NotFound(e.Message); }
        catch (InvalidOperationException e) { return BadRequest(e.Message); }
    }

    [HttpPost("{executionId:guid}/complete")]
    public async Task<ActionResult<TourExecutionResponse>> Complete(Guid tourId, Guid executionId)
    {
        var touristId = HttpContext.Items["userId"] as string;
        if (string.IsNullOrEmpty(touristId)) return Unauthorized();

        try
        {
            var execution = await executionService.CompleteExecutionAsync(touristId, executionId);
            return Ok(execution);
        }
        catch (KeyNotFoundException e) { return NotFound(e.Message); }
        catch (UnauthorizedAccessException) { return StatusCode(403); }
        catch (InvalidOperationException e) { return BadRequest(e.Message); }
    }

    [HttpPost("{executionId:guid}/abandon")]
    public async Task<ActionResult<TourExecutionResponse>> Abandon(Guid tourId, Guid executionId)
    {
        var touristId = HttpContext.Items["userId"] as string;
        if (string.IsNullOrEmpty(touristId)) return Unauthorized();

        try
        {
            var execution = await executionService.AbandonExecutionAsync(touristId, executionId);
            return Ok(execution);
        }
        catch (KeyNotFoundException e) { return NotFound(e.Message); }
        catch (UnauthorizedAccessException) { return StatusCode(403); }
        catch (InvalidOperationException e) { return BadRequest(e.Message); }
    }
}