using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TimeOffRequestController : ControllerBase
{
    private readonly AppDbContext _context;

    public TimeOffRequestController(AppDbContext context)
    {
        _context = context;
    }

    [HttpPost]
    public async Task<ActionResult<TimeOffRequest>> CreateRequest(CreateTimeOffRequest request)
    {
        if (request.EndDate < request.StartDate)
        {
            return BadRequest("End date cannot be before start date.");
        }

        var today = DateOnly.FromDateTime(DateTime.Today);

        if (request.EndDate < today)
        {
            return BadRequest("Request dates have passed");
        }

        var employeeExists = await _context.Employees.AnyAsync(e => e.Id == request.EmployeeId);

        if (!employeeExists)
        {
            return BadRequest("Employee does not exist");
        }


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

        return Ok(timeOffRequest);
        }

        [HttpGet("employee/{employeeId}")]
        public async Task<ActionResult<IEnumerable<TimeOffRequest>>> GetEmployeeRequests( int employeeId)
    {
        return await _context.TimeOffRequests.Where(r => r.EmployeeId == employeeId).ToListAsync();
    }


}