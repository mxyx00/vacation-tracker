import {useEffect, useState} from "react";

interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: number;
}

interface TimeOffRequest{
  id: number;
  employeeId: number;
  startDate: string;
  endDate: string;
  type: number;
  status: number;
  employeeComment: string | null; // | can be empty
  managerComment: string | null;
}

function App() {

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number>(0);
  const [requests,setRequests] = useState<TimeOffRequest[]>([]);

  useEffect(() => {
    fetch("http://localhost:5175/api/employees").then(response => response.json()).then(data => setEmployees(data)).catch(error => console.error("Error loading employees:",error));},[]);

  useEffect(() => {if (selectedEmployeeId ===0) {return;}

    fetch('http://localhost:5175/api/timeoffrequests/employee/${selectedEmployeeId}').then(response => response.json()).then(data => setRequests(data)).catch(error => console.error("Error loading requests:",error));}, [selectedEmployeeId]);

    function getTypeName(type: number) {
      switch (type){
        case 0:
          return "Vacation";
        case 1:
          return "Unpaid Leave";
        case 2: 
          return "Parental Leave";
        case 3: 
          return "Sick Leave";
        default:
          return "?";
      }
    }

  function getStatusName(status: number){
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

  return (
      <div>
          <h1>Vacation Request Tracker</h1>

          <label>

          Current User:
          <select value={selectedEmployeeId}
          onChange={e => setSelectedEmployeeId(Number(e.target.value))}>

            {employees.map(employee => (<option key={employee.id} value={employee.id}>
              {employee.firstName} {employee.lastName}
            </option>))}
          </select>
          </label>


          <h2>Employees</h2>

          {employees.map(employee => (<div key={employee.id}>
            <p>
              {employee.firstName} {employee.lastName}
            </p>
      </div>
          ))}
        </div>
  );

}

export default App;
