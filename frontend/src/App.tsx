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
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number>(0);
  const [requests, setRequests] = useState<TimeOffRequest[]>([]);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [type, setType] = useState(0);
  const [comment, setComment] = useState("");

  const [managerRequests, setManagerRequests] = useState<TimeOffRequest[]>([]);

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

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const newRequest = {
      employeeId: selectedEmployeeId,
      startDate: startDate,
      endDate: endDate,
      type: type,
      employeeComment: comment
    };

    const response = await fetch(
      "http://localhost:5175/api/timeoffrequests",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(newRequest)
      }
    );

    if (!response.ok) {
      const errorMessage = await response.text();
      alert(errorMessage);
      return;
    }

    setStartDate("");
    setEndDate("");
    setType(0);
    setComment("");

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
  }

  return (
    <div>
      <h1>Vacation Request Tracker</h1>

      <label>
        Current User:
        <select
          value={selectedEmployeeId}
          onChange={e =>
            setSelectedEmployeeId(Number(e.target.value))
          }
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

      <h2>New Request</h2>

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
          Submit Request
        </button>
      </form>

      <h2>My Requests</h2>

      {requests.length === 0 ? (
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
            </tr>
          </thead>

          <tbody>
            {requests.map(request => (
              <tr key={request.id}>
                <td>{getTypeName(request.type)}</td>
                <td>{request.startDate}</td>
                <td>{request.endDate}</td>
                <td>{getStatusName(request.status)}</td>
                <td>{request.employeeComment}</td>
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