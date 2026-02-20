import { useEffect, useRef, useState } from "react";
import { createEmployee, deleteEmployee, getEmployees, normalizePage, toggleAttendance } from "../../services/api";
import ConfirmDialog from "../common/ConfirmDialog";
import DataTable from "../common/DataTable";
import PaginationControls from "../common/PaginationControls";
import EmployeeAttendanceModal from "./EmployeeAttendanceModal";
import EmployeeFormModal from "./EmployeeFormModal";

function todayIso() {
  const now = new Date();
  const month = `${now.getMonth() + 1}`.padStart(2, "0");
  const day = `${now.getDate()}`.padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

export default function EmployeeSection() {
  const [data, setData] = useState({ items: [], page: 1, pages: 1 });
  const [search, setSearch] = useState("");
  const [attendanceDate, setAttendanceDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [deleteId, setDeleteId] = useState("");
  const [markingId, setMarkingId] = useState("");
  const [attendanceEmployeeId, setAttendanceEmployeeId] = useState("");
  const toastTimerRef = useRef(null);

  const showToast = (message, type = "success") => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    setToast({ show: true, message, type });
    toastTimerRef.current = setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
      toastTimerRef.current = null;
    }, 2500);
  };

  const fetchEmployees = async (page = 1) => {
    setLoading(true);
    setError("");
    try {
      const response = await getEmployees({
        page,
        size: 10,
        search: search || undefined,
        date: attendanceDate || todayIso()
      });
      setData(normalizePage(response));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees(1);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const handleCreate = async (form) => {
    setCreateLoading(true);
    try {
      await createEmployee(form);
      await fetchEmployees(1);
      showToast("Employee created successfully");
    } catch (e) {
      showToast(e.message || "Unable to create employee", "error");
      throw e;
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setError("");
    try {
      await deleteEmployee(deleteId);
      setDeleteId("");
      await fetchEmployees(data.page);
    } catch (e) {
      setError(e.message);
    }
  };

  const handleMarkAttendance = async (employee) => {
    setError("");
    setMarkingId(employee.employee_id);
    try {
      const targetDate = attendanceDate || todayIso();
      const result = await toggleAttendance({
        employee_id: employee.employee_id,
        date: targetDate,
        is_present: true
      });
      showToast(`${employee.full_name} attendance ${result.action} for ${targetDate}`);
      await fetchEmployees(data.page || 1);
    } catch (e) {
      setError(e.message);
    } finally {
      setMarkingId("");
    }
  };

  const columns = [
    { key: "employee_id", title: "Employee ID" },
    { key: "full_name", title: "Full Name" },
    { key: "email", title: "Email" },
    { key: "department", title: "Department" },
    {
      key: "actions",
      title: "Actions",
      render: (row) => (
        <div className="actions-inline">
          <button
            className="icon-btn"
            title={row.is_present ? "Unmark Attendance" : "Mark Attendance"}
            data-tooltip={row.is_present ? "Unmark Attendance" : "Mark Attendance"}
            aria-label={row.is_present ? "Unmark Attendance" : "Mark Attendance"}
            onClick={() => handleMarkAttendance(row)}
            disabled={markingId === row.employee_id}
          >
            {markingId === row.employee_id ? "..." : row.is_present ? "✖" : "✔"}
          </button>
          <button
            className="icon-btn"
            title="View Attendance"
            data-tooltip="View Attendance"
            aria-label="View Attendance"
            onClick={() => setAttendanceEmployeeId(row.employee_id)}
          >
            👁
          </button>
          <button
            className="icon-btn danger"
            title="Delete Employee"
            data-tooltip="Delete Employee"
            aria-label="Delete Employee"
            onClick={() => setDeleteId(row.employee_id)}
          >
            🗑
          </button>
        </div>
      )
    }
  ];

  return (
    <section className="panel">
      <div className="panel-head">
        <h2>Employee Management</h2>
        <div className="head-actions">
          <label className="field compact">
            <span>Attendance Date</span>
            <input
              type="date"
              value={attendanceDate}
              onChange={(e) => setAttendanceDate(e.target.value)}
              placeholder="Defaults to today"
            />
          </label>
          <input
            className="search-input"
            placeholder="Search by name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="btn btn-secondary" onClick={() => fetchEmployees(1)}>Search</button>
          <button className="btn btn-primary" onClick={() => setIsCreateOpen(true)}>Create Employee</button>
        </div>
      </div>

      {toast.show && <div className={`toast ${toast.type}`}>{toast.message}</div>}
      {loading && <div className="state-box">Loading employees...</div>}
      {!loading && error && <div className="state-box error">{error}</div>}
      {!loading && !error && data.items.length === 0 && <div className="state-box">No employees found</div>}
      {!loading && !error && data.items.length > 0 && <DataTable columns={columns} rows={data.items} />}
      {!loading && !error && data.items.length > 0 && (
        <PaginationControls page={data.page} pages={data.pages} onPageChange={fetchEmployees} />
      )}

      <EmployeeFormModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreate}
        submitting={createLoading}
      />

      <EmployeeAttendanceModal
        employeeId={attendanceEmployeeId}
        isOpen={!!attendanceEmployeeId}
        onClose={() => setAttendanceEmployeeId("")}
      />

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Delete Employee"
        text={`Delete employee ${deleteId}?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId("")}
      />
    </section>
  );
}
