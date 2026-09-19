
using System.ComponentModel.DataAnnotations;

namespace backend.Models;

public class TimeOffRequest
{
    public int Id {get;set;}
    public int EmployeeId {get;set;}
    public Employee Employee {get;set;} = null!;

    public DateOnly StartDate {get;set;} //dateonly
    public DateOnly EndDate {get;set;}

    public TimeOffType Type {get;set;}

    public RequestStatus Status {get;set;} = RequestStatus.InReview;

    public string? EmployeeComment {get;set;}
    public string? ManagerComment {get;set;}


}