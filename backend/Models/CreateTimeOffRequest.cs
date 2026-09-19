namespace backend.Models;

public class CreateTimeOffRequest
{
    public int EmployeeId {get;set;}
    public DateOnly StartDate {get;set;}
    public DateOnly EndDate {get;set;}

    public TimeOffType Type {get;set;}

    public string? EmployeeComment {get;set;}
}