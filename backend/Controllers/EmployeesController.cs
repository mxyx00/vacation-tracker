// personal reference:
// [apicontroller] + [httpget]: https://medium.com/@sweetondonie/a-beginners-guide-to-httpget-route-and-apicontroller-in-asp-net-core-b7ca0728f401
// mvc: https://learn.microsoft.com/en-us/aspnet/core/mvc/overview?view=aspnetcore-10.0

using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Mvc; 
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EmployeesController : ControllerBase //extending controller class
{
    private readonly AppDbContext _context;

    public EmployeesController(AppDbContext context) // dependency injection
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Employee>>> GetEmployees()
    {
        return await _context.Employees.ToListAsync(); // ef core --> get every employee
    }
}
