namespace backend.Models;

public class CreateTimeOffRequest
{
    public int EmployeeId {get;set;}
    public DateTime StartDate {get;set;}
    public DateTime EndDate {get;set;}

    public TimeOffType Type {get;set;}

    public string? EmployeeComment {get;set;}
}