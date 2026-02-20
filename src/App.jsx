import { useState } from "react";
import AttendanceSection from "./components/attendance/AttendanceSection";
import EmployeeSection from "./components/employees/EmployeeSection";

export default function App() {
  const [tab, setTab] = useState("employees");

  return (
    <div className="layout">
      <header className="topbar">
        <h1>HRMS Admin Panel</h1>
        <div className="tabs">
          <button
            className={`tab ${tab === "employees" ? "active" : ""}`}
            onClick={() => setTab("employees")}
          >
            Employees
          </button>
          <button
            className={`tab ${tab === "attendance" ? "active" : ""}`}
            onClick={() => setTab("attendance")}
          >
            Attendance
          </button>
        </div>
      </header>

      <main>
        {tab === "employees" ? <EmployeeSection /> : <AttendanceSection />}
      </main>
    </div>
  );
}
