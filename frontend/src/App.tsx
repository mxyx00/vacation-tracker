import {useEffect, useState} from "react";

interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: number;
}

function App() {

  const [employees, setEmployees] = useState<Employee[]>([]);

  useEffect(() => {
    fetch("http://localhost:5175/api/employees").then(response => response.json()).then(data => setEmployees(data)).catch(error => console.error("Error loading employees:",error));},[]);

  return (
      <div>
          <h1>Vacation Request Tracker</h1>
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
