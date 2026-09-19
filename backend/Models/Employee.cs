using System.ComponentModel.DataAnnotations;

namespace backend.Models;

public class Employee
{
    public int Id { get;set;}

    [Required]
    public string FirstName {get; set;} = string.Empty;

    [Required]
    public string LastName {get;set;} = string.Empty;

    [Required]
    public string Email {get;set;} = string.Empty;

    public EmployeeRole Role {get; set;} = EmployeeRole.Employee;

    public ICollection<TimeOffRequest> TimeOffRequests{get;set;} = new List<TimeOffRequest>();


}