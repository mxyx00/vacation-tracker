//  Managers can view pending requests and
// approve or reject them with optional comments. 


namespace backend.Models; 

public enum RequestStatus
{
    InReview, 
    Approved, 
    Rejected
}