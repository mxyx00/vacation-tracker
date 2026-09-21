// personal reference: https://stackoverflow.com/questions/14455293/how-and-when-to-use-async-and-await

using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TimeOffRequestsController : ControllerBase
{
    private readonly AppDbContext _context;

    public TimeOffRequestsController(AppDbContext context)
    {
        _context = context;
    }

    // new request
    [HttpPost]
    public async Task<ActionResult<TimeOffRequest>> CreateRequest(CreateTimeOffRequest request)
    {
        if (request.EndDate < request.StartDate)
        {
            return BadRequest("End date cannot be before start date.");
        }

        if (request.EndDate < DateTime.Today)
        {
            return BadRequest("Request dates have passed.");
        }

        var employeeExists = await _context.Employees.AnyAsync(employee => employee.Id == request.EmployeeId);


        var timeOffRequest = new TimeOffRequest
        {
            EmployeeId = request.EmployeeId,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            Type = request.Type,
            Status = RequestStatus.InReview,
            EmployeeComment = request.EmployeeComment
        };

        _context.TimeOffRequests.Add(timeOffRequest);
        await _context.SaveChangesAsync();

        return Ok(timeOffRequest); // https://learn.microsoft.com/en-us/dotnet/api/system.web.http.apicontroller.ok?view=aspnetcore-2.2
    }

    // Get requests for one employee
    [HttpGet("employee/{employeeId}")]
    public async Task<ActionResult<IEnumerable<TimeOffRequest>>> GetEmployeeRequests(int employeeId)
    {
        var requests = await _context.TimeOffRequests
            .Where(request => request.EmployeeId == employeeId)
            .ToListAsync();

        return requests;
    }

    [HttpGet("in-review")]
    public async Task<ActionResult<IEnumerable<TimeOffRequest>>> GetInReviewRequests()
    {
        var requests = await _context.TimeOffRequests
            .Where(request => request.Status == RequestStatus.InReview)
            .ToListAsync();

        return requests;
    }

    // Approval
    [HttpPut("{id}/approve")]
    public async Task<IActionResult> ApproveRequest(int id, string? managerComment)
    {
        var request = await _context.TimeOffRequests.FindAsync(id);

        if (request == null)
        {
            return NotFound();
        }

        if (request.Status != RequestStatus.InReview)
        {
            return BadRequest("Only requests in review can be approved.");
        }

        request.Status = RequestStatus.Approved;
        request.ManagerComment = managerComment;

        await _context.SaveChangesAsync();

        return Ok(request);
    }

    [HttpPut("{id}/reject")]
    public async Task<IActionResult> RejectRequest(int id, string? managerComment)
    {
        var request = await _context.TimeOffRequests.FindAsync(id);

        if (request == null)
        {
            return NotFound();
        }

        if (request.Status != RequestStatus.InReview)
        {
            return BadRequest("Only requests in review can be rejected.");
        }

        request.Status = RequestStatus.Rejected;
        request.ManagerComment = managerComment;

        await _context.SaveChangesAsync();

        return Ok(request);
    }

    // edit request
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateRequest(int id, CreateTimeOffRequest updatedRequest)
    {
        var request = await _context.TimeOffRequests.FindAsync(id);

        if (updatedRequest.EndDate < updatedRequest.StartDate)
        {
            return BadRequest("End date cannot be before start date.");
        }

        if (updatedRequest.EndDate < DateTime.Today)
        {
            return BadRequest("Request cannot be in the past.");
        }

        request.StartDate = updatedRequest.StartDate;
        request.EndDate = updatedRequest.EndDate;
        request.Type = updatedRequest.Type;
        request.EmployeeComment = updatedRequest.EmployeeComment;

        await _context.SaveChangesAsync();

        return Ok(request);
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<TimeOffRequest>>> GetAllRequests()
    {
        var requests = await _context.TimeOffRequests.ToListAsync();
        return requests;
    }
}