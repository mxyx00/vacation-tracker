import { useEffect, useState, type FormEvent } from "react";

interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: number;
}

interface TimeOffRequest {
  id: number;
  employeeId: number;
  startDate: string;
  endDate: string;
  type: number;
  status: number;
  employeeComment: string | null;
  managerComment: string | null;
}

function App() {

  //state variables
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number>(0);
  const [requests, setRequests] = useState<TimeOffRequest[]>([]);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [type, setType] = useState(0);
  const [comment, setComment] = useState("");
  const [editingRequestId, setEditingRequestId] = useState<number | null>(null); //alows users to edit


  const [managerRequests, setManagerRequests] = useState<TimeOffRequest[]>([]);

  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetch("http://localhost:5175/api/employees")
      .then(response => response.json())
      .then(data => {
        setEmployees(data);

        if (data.length > 0) {
          setSelectedEmployeeId(data[0].id);
        }
      })
      .catch(error =>
        console.error("Error loading employees:", error)
      );
  }, []);

  useEffect(() => {
    if (selectedEmployeeId === 0) {
      return;
    }

    loadRequests(selectedEmployeeId);
  }, [selectedEmployeeId]);

  function loadRequests(employeeId: number) {
    fetch(
      `http://localhost:5175/api/timeoffrequests/employee/${employeeId}`
    )
      .then(response => response.json())
      .then(data => setRequests(data))
      .catch(error =>
        console.error("Error loading requests:", error)
      );
  }

  async function handleSubmit(event: FormEvent) 
  {
    event.preventDefault();

    const requestData = {
      employeeId: selectedEmployeeId,
      startDate: startDate,
      endDate: endDate,
      type: type,
      employeeComment: comment
    };

    let url = "http://localhost:5175/api/timeoffrequests";
    let method = "POST";

    if (editingRequestId !== null) {
      url = `http://localhost:5175/api/timeoffrequests/${editingRequestId}`;
      method = "PUT";
    }

    const response = await fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestData)
    });

    if (!response.ok) {
      const errorMessage = await response.text();
      alert(errorMessage);
      return;
    }

  setStartDate("");
  setEndDate("");
  setType(0);
  setComment("");
  setEditingRequestId(null);

  loadRequests(selectedEmployeeId);
}

  function getTypeName(type: number) {
    switch (type) {
      case 0:
        return "Vacation";
      case 1:
        return "Unpaid Leave";
      case 2:
        return "Parental Leave";
      case 3:
        return "Sick Leave";
      default:
        return "Unknown";
    }
  }

  function getStatusName(status: number) {
    switch (status) {
      case 0:
        return "In Review";
      case 1:
        return "Approved";
      case 2:
        return "Rejected";
      default:
        return "Unknown";
    }
  }

  const selectedEmployee = employees.find(
    employee => employee.id === selectedEmployeeId
  );

  function loadManagerRequests() {
    fetch("http://localhost:5175/api/timeoffrequests/in-review")
      .then(response => response.json())
      .then(data => setManagerRequests(data))
      .catch(error =>
        console.error("Error loading manager requests:", error)
      );
  }

  useEffect(() => {
    if (selectedEmployee?.role === 1) {
      loadManagerRequests();
    }
  }, [selectedEmployeeId, employees]);

  function getEmployeeName(employeeId: number) {
    const employee = employees.find(
      employee => employee.id === employeeId
    );

    if (!employee) {
      return "Unknown Employee";
    }

    return `${employee.firstName} ${employee.lastName}`;
  }

  async function approveRequest(id: number) {
    const comment =
      window.prompt("Optional manager comment:") ?? "";

    const response = await fetch(
      `http://localhost:5175/api/timeoffrequests/${id}/approve?managerComment=${encodeURIComponent(comment)}`,
      {
        method: "PUT"
      }
    );

    if (!response.ok) {
      const errorMessage = await response.text();
      alert(errorMessage);
      return;
    }

    loadManagerRequests();
    loadRequests(selectedEmployeeId); //refreshes
  }

  async function rejectRequest(id: number) {
    const comment =
      window.prompt("Optional manager comment:") ?? "";

    const response = await fetch(
      `http://localhost:5175/api/timeoffrequests/${id}/reject?managerComment=${encodeURIComponent(comment)}`,
      {
        method: "PUT"
      }
    );

    if (!response.ok) {
      const errorMessage = await response.text();
      alert(errorMessage);
      return;
    }

    loadManagerRequests();
    loadRequests(selectedEmployeeId); //refresh test
  }

  function editRequest(request: TimeOffRequest)
  {
    setEditingRequestId(request.id);

    setStartDate(request.startDate.substring(0, 10));
    setEndDate(request.endDate.substring(0, 10));
    setType(request.type);
    setComment(request.employeeComment ?? "");
  }

  // filter 

  const filteredRequests = requests.filter(request => {
    if (statusFilter === "all") {
      return true;
    }

    return request.status === Number(statusFilter);
  });

  return (
    <div>
      <h1>Vacation Request Tracker</h1>

      <label>
        Current User:
        <select
          value={selectedEmployeeId}
          onChange={e => {
              setSelectedEmployeeId(Number(e.target.value));
              setStatusFilter("all"); // when changing users, refreshes the filter to all automatically
            }}
        >
          {employees.map(employee => (
            <option
              key={employee.id}
              value={employee.id}
            >
              {employee.firstName} {employee.lastName}
            </option>
          ))}
        </select>
      </label>

      <h2>{editingRequestId === null ? "New Request" : "Edit Request"}</h2>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Start Date: </label>

          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            required
          />
        </div>

        <div>
          <label>End Date: </label>

          <input
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Leave Type: </label>

          <select
            value={type}
            onChange={e =>
              setType(Number(e.target.value))
            }
          >
            <option value={0}>Vacation</option>
            <option value={1}>Unpaid Leave</option>
            <option value={2}>Parental Leave</option>
            <option value={3}>Sick Leave</option>
          </select>
        </div>

        <div>
          <label>Comment: </label>

          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
          />
        </div>

        <button type="submit">
        {editingRequestId === null ? "Submit Request" : "Save Changes"}
        </button>
      </form>

      

      <h2>My Requests</h2>

      <label>
        Filter by Status:{" "}
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="all">All</option>
          <option value="0">In Review</option>
          <option value="1">Approved</option>
          <option value="2">Rejected</option>
        </select>
      </label>

      {filteredRequests.length === 0 ? ( //change to filteredRequests after making dropdown
        <p>No requests found.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Type</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Status</th>
              <th>Comment</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredRequests.map(request => (
              <tr key={request.id}>
                <td>{getTypeName(request.type)}</td>
                <td>{request.startDate}</td>
                <td>{request.endDate}</td>
                <td>{getStatusName(request.status)}</td>
                <td>{request.employeeComment}</td>
                  <td>
                    {request.status === 0 && (
                      <button onClick={() => editRequest(request)}>
                        Edit
                      </button>
                    )}
                  </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {selectedEmployee?.role === 1 && (
        <div>
          <h2>Manager Review</h2>

          {managerRequests.length === 0 ? (
            <p>No requests waiting for review.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Type</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Comment</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {managerRequests.map(request => (
                  <tr key={request.id}>
                    <td>
                      {getEmployeeName(request.employeeId)}
                    </td>

                    <td>
                      {getTypeName(request.type)}
                    </td>

                    <td>
                      {request.startDate}
                    </td>

                    <td>
                      {request.endDate}
                    </td>

                    <td>
                      {request.employeeComment}
                    </td>

                    <td>
                      <button
                        onClick={() =>
                          approveRequest(request.id)
                        }
                      >
                        Approve
                      </button>

                      <button
                        onClick={() =>
                          rejectRequest(request.id)
                        }
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

export default App;