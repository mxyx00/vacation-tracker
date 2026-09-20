import { useEffect, useState, type FormEvent } from "react";
import "./App.css";

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
  const [managerRequests, setManagerRequests] = useState<TimeOffRequest[]>([]);
  const [allRequests, setAllRequests] = useState<TimeOffRequest[]>([]);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [type, setType] = useState(0);
  const [comment, setComment] = useState("");

  const [editingRequestId, setEditingRequestId] =
    useState<number | null>(null);

  const [statusFilter, setStatusFilter] = useState("all");

  // Load employees when the page first opens
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

  // Load requests for the currently selected employee
  useEffect(() => {
    if (selectedEmployeeId === 0) {
      return;
    }

    loadRequests(selectedEmployeeId);
  }, [selectedEmployeeId]);

  // Load all requests for the timeline
  useEffect(() => {
    loadAllRequests();
  }, []);

  const selectedEmployee = employees.find(
    employee => employee.id === selectedEmployeeId
  );

  // If the selected user is a manager, load requests waiting for review
  useEffect(() => {
    if (selectedEmployee?.role === 1) {
      loadManagerRequests();
    }
  }, [selectedEmployeeId, employees]);

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

  function loadManagerRequests() {
    fetch("http://localhost:5175/api/timeoffrequests/in-review")
      .then(response => response.json())
      .then(data => setManagerRequests(data))
      .catch(error =>
        console.error("Error loading manager requests:", error)
      );
  }

  function loadAllRequests() {
    fetch("http://localhost:5175/api/timeoffrequests")
      .then(response => response.json())
      .then(data => setAllRequests(data))
      .catch(error =>
        console.error("Error loading all requests:", error)
      );
  }

  async function handleSubmit(event: FormEvent) {
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
      url =
        `http://localhost:5175/api/timeoffrequests/${editingRequestId}`;

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

    clearForm();

    loadRequests(selectedEmployeeId);
    loadAllRequests();
  }

  function clearForm() {
    setStartDate("");
    setEndDate("");
    setType(0);
    setComment("");
    setEditingRequestId(null);
  }

  function editRequest(request: TimeOffRequest) {
    setEditingRequestId(request.id);

    setStartDate(request.startDate.substring(0, 10));
    setEndDate(request.endDate.substring(0, 10));
    setType(request.type);
    setComment(request.employeeComment ?? "");
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
    loadRequests(selectedEmployeeId);
    loadAllRequests();
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
    loadRequests(selectedEmployeeId);
    loadAllRequests();
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

  // makes date from UTC to nice
    function formatDate(date: string) {
    return parseDate(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  }

  function getEmployeeName(employeeId: number) {
    const employee = employees.find(
      employee => employee.id === employeeId
    );

    if (!employee) {
      return "Unknown Employee";
    }

    return `${employee.firstName} ${employee.lastName}`;
  }

  // Filter the selected employee's requests
  const filteredRequests = requests.filter(request => {
    if (statusFilter === "all") {
      return true;
    }

    return request.status === Number(statusFilter);
  });

  // Only approved requests appear on the timeline
  const approvedRequests = allRequests.filter(
    request => request.status === 1
  );

  function parseDate(date: string) {
    return new Date(
      date.substring(0, 10) + "T00:00:00"
    );
  }

  const millisecondsPerDay =
    1000 * 60 * 60 * 24;

  let timelineStart: Date | null = null;
  let timelineEnd: Date | null = null;

  if (approvedRequests.length > 0) {
    timelineStart = new Date(
      Math.min(
        ...approvedRequests.map(request =>
          parseDate(request.startDate).getTime()
        )
      )
    );

    timelineEnd = new Date("2026-12-31T00:00:00");
  }
  

  function getTimelineStyle(request: TimeOffRequest) {
    if (!timelineStart || !timelineEnd) {
      return {};
    }

    const requestStart = parseDate(request.startDate);
    const requestEnd = parseDate(request.endDate);

    const totalDays =
      Math.round(
        (timelineEnd.getTime() -
          timelineStart.getTime()) /
          millisecondsPerDay
      ) + 1;

    const startOffset =
      Math.round(
        (requestStart.getTime() -
          timelineStart.getTime()) /
          millisecondsPerDay
      );

    const requestLength =
      Math.round(
        (requestEnd.getTime() -
          requestStart.getTime()) /
          millisecondsPerDay
      ) + 1;

    return {
      left: `${(startOffset / totalDays) * 100}%`,
      width: `${(requestLength / totalDays) * 100}%`
    };
  }

  return (
    <div>
      <h1>Vacation Request Tracker</h1>

      <label className="user-selector">
        Current User:{" "}
        <select
          value={selectedEmployeeId}
          onChange={e => {
            setSelectedEmployeeId(
              Number(e.target.value)
            );

            setStatusFilter("all");
            clearForm();
          }}
        >
          {employees.map(employee => (
            <option
              key={employee.id}
              value={employee.id}
            >
              {employee.firstName}{" "}
              {employee.lastName}
            </option>
          ))}
        </select>
      </label>

        <section className="section-card">
      <h2>
        {editingRequestId === null
          ? "New Request"
          : "Edit Request"}
      </h2>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Start Date: </label>

          <input
            type="date"
            value={startDate}
            onChange={e =>
              setStartDate(e.target.value)
            }
            required
          />
        </div>

        <div>
          <label>End Date: </label>

          <input
            type="date"
            value={endDate}
            onChange={e =>
              setEndDate(e.target.value)
            }
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
            <option value={0}>
              Vacation
            </option>

            <option value={1}>
              Unpaid Leave
            </option>

            <option value={2}>
              Parental Leave
            </option>

            <option value={3}>
              Sick Leave
            </option>
          </select>
        </div>

        <div>
          <label>Comment: </label>

          <textarea
            value={comment}
            onChange={e =>
              setComment(e.target.value)
            }
          />
        </div>

        <button type="submit">
          {editingRequestId === null
            ? "Submit Request"
            : "Save Changes"}
        </button>

        {editingRequestId !== null && (
          <button
            type="button"
            onClick={clearForm}
          >
            Cancel
          </button>
        )}
      </form>
      </section>

        <div className = "section-header">
      <h2>My Requests</h2>

      <label>
        Filter by Status:{" "}
        <select
          value={statusFilter}
          onChange={e =>
            setStatusFilter(e.target.value)
          }
        >
          <option value="all">
            All
          </option>

          <option value="0">
            In Review
          </option>

          <option value="1">
            Aproved
          </option>

          <option value="2">
            Rejected
          </option>
        </select>
      </label>
      </div>

      {filteredRequests.length === 0 ? (
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
              <th>Manager Comment</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredRequests.map(request => (
              <tr key={request.id}>
                <td>
                  {getTypeName(request.type)}
                </td>

                <td>{formatDate(request.startDate)}</td>
                <td>{formatDate(request.endDate)}</td>

                <td>
                  {getStatusName(
                    request.status
                  )}
                </td>

                <td>
                  {request.employeeComment}
                </td>

                <td>  {request.managerComment || "-"}</td>

                <td>
                  {request.status === 0 && (
                    <button
                      onClick={() =>
                        editRequest(request)
                      }
                    >
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
            <p>
              No requests waiting for review.
            </p>
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
                {managerRequests.map(
                  request => (
                    <tr key={request.id}>
                      <td>
                        {getEmployeeName(
                          request.employeeId
                        )}
                      </td>

                      <td>
                        {getTypeName(
                          request.type
                        )}
                      </td>

                      <td>{formatDate(request.startDate)}</td>
                      <td>{formatDate(request.endDate)}</td>

                      <td>
                        {
                          request.employeeComment
                        }
                      </td>

                      <td>
                        <button
                          onClick={() =>
                            approveRequest(
                              request.id
                            )
                          }
                        >
                          Approve
                        </button>

                        <button
                          onClick={() =>
                            rejectRequest(
                              request.id
                            )
                          }
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          )}
        </div>
      )}

      <h2>Approved Time Off</h2>

      {approvedRequests.length === 0 ? (
        <p>No approved time off found.</p>
      ) : (
        <div className="timeline">
          <div className="timeline-dates">
            <span>
              {timelineStart?.toLocaleDateString()}
            </span>

            <span>
              {timelineEnd?.toLocaleDateString()}
            </span>
          </div>

          {approvedRequests.map(request => (
            <div
              className="timeline-row"
              key={request.id}
            >
              <div className="timeline-name">
                {getEmployeeName(
                  request.employeeId
                )}
              </div>

              <div className="timeline-track">
                <div
                  className="timeline-bar"
                  style={getTimelineStyle(
                    request
                  )}
                >
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;