import { useEffect, useRef, useState } from "react";
import { getAllAttendance, normalizePage, toggleAttendance } from "../../services/api";
import DataTable from "../common/DataTable";
import PaginationControls from "../common/PaginationControls";
import StatusBadge from "../common/StatusBadge";

function todayIso() {
  const now = new Date();
  const month = `${now.getMonth() + 1}`.padStart(2, "0");
  const day = `${now.getDate()}`.padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

export default function AttendanceSection() {
  const [data, setData] = useState({ items: [], page: 1, pages: 1 });
  const [dateFilter, setDateFilter] = useState(todayIso());
  const [employeeFilter, setEmployeeFilter] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState({ show: false, message: "" });
  const [unmarkingKey, setUnmarkingKey] = useState("");
  const toastTimerRef = useRef(null);

  const showToast = (message) => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    setToast({ show: true, message });
    toastTimerRef.current = setTimeout(() => {
      setToast({ show: false, message: "" });
      toastTimerRef.current = null;
    }, 2500);
  };

  const fetchAttendance = async (page = 1) => {
    setLoading(true);
    setError("");
    try {
      const response = await getAllAttendance({
        page,
        size: 10,
        date: dateFilter || undefined,
        employee_id: employeeFilter || undefined,
        search: search || undefined
      });
      setData(normalizePage(response));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance(1);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const handleToggleAttendance = async (row) => {
    setError("");
    const key = `${row.employee_id}-${row.date}`;
    setUnmarkingKey(key);
    try {
      const result = await toggleAttendance({
        employee_id: row.employee_id,
        date: row.date,
        is_present: true
      });
      if (result.action === "unmarked") {
        showToast(`${row.employee_name} attendance unmarked for ${row.date}`);
      } else {
        showToast(`${row.employee_name} attendance marked for ${row.date}`);
      }
      await fetchAttendance(data.page || 1);
    } catch (e) {
      setError(e.message);
    } finally {
      setUnmarkingKey("");
    }
  };

  const columns = [
    { key: "employee_id", title: "Employee ID" },
    { key: "employee_name", title: "Employee Name" },
    { key: "date", title: "Date" },
    { key: "status", title: "Status", render: (row) => <StatusBadge isPresent={row.is_present} /> },
    {
      key: "action",
      title: "Action",
      render: (row) => {
        const key = `${row.employee_id}-${row.date}`;
        return (
          <button
            className="icon-btn danger"
            title={row.is_present ? "Unmark Attendance" : "Mark Attendance"}
            data-tooltip={row.is_present ? "Unmark Attendance" : "Mark Attendance"}
            aria-label={row.is_present ? "Unmark Attendance" : "Mark Attendance"}
            onClick={() => handleToggleAttendance(row)}
            disabled={unmarkingKey === key}
          >
            {unmarkingKey === key ? "..." : row.is_present ? "x" : "+"}
          </button>
        );
      }
    }
  ];

  return (
    <section className="panel">
      <div className="panel-head">
        <h2>Attendance Management</h2>
        <div className="head-actions">
          <label className="field compact">
            <span>Date</span>
            <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
          </label>
          <input
            className="search-input"
            placeholder="Employee ID"
            value={employeeFilter}
            onChange={(e) => setEmployeeFilter(e.target.value)}
          />
          <input
            className="search-input"
            placeholder="Search employee name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="btn btn-secondary" onClick={() => fetchAttendance(1)}>Apply</button>
        </div>
      </div>

      {toast.show && <div className="toast success">{toast.message}</div>}
      {loading && <div className="state-box">Loading attendance...</div>}
      {!loading && error && <div className="state-box error">{error}</div>}
      {!loading && !error && data.items.length === 0 && <div className="state-box">No attendance records</div>}
      {!loading && !error && data.items.length > 0 && <DataTable columns={columns} rows={data.items} />}
      {!loading && !error && data.items.length > 0 && (
        <PaginationControls page={data.page} pages={data.pages} onPageChange={fetchAttendance} />
      )}
    </section>
  );
}
