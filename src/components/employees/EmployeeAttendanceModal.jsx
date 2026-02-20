import { useEffect, useState } from "react";
import { getEmployeeAttendance, normalizePage } from "../../services/api";
import DataTable from "../common/DataTable";
import Modal from "../common/Modal";
import PaginationControls from "../common/PaginationControls";
import StatusBadge from "../common/StatusBadge";

export default function EmployeeAttendanceModal({ employeeId, isOpen, onClose }) {
  const [data, setData] = useState({ items: [], page: 1, pages: 1 });
  const [dateFilter, setDateFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchData = async (page = 1) => {
    if (!employeeId) return;
    setLoading(true);
    setError("");
    try {
      const response = await getEmployeeAttendance(employeeId, { page, size: 5, date: dateFilter || undefined });
      const normalized = normalizePage(response);
      setData(normalized);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchData(1);
    }
  }, [isOpen, employeeId]);

  const columns = [
    { key: "date", title: "Date" },
    { key: "status", title: "Status", render: (row) => <StatusBadge isPresent={row.is_present} /> }
  ];

  return (
    <Modal isOpen={isOpen} title={`Attendance - ${employeeId || ""}`} onClose={onClose}>
      <div className="filter-row">
        <label className="field compact">
          <span>Date</span>
          <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
        </label>
        <button className="btn btn-secondary" onClick={() => fetchData(1)}>Apply</button>
      </div>

      {loading && <div className="state-box">Fetching attendance...</div>}
      {!loading && error && <div className="state-box error">{error}</div>}
      {!loading && !error && data.items.length === 0 && <div className="state-box">No attendance records</div>}
      {!loading && !error && data.items.length > 0 && <DataTable columns={columns} rows={data.items} />}

      {!loading && !error && data.items.length > 0 && (
        <PaginationControls page={data.page} pages={data.pages} onPageChange={fetchData} />
      )}
    </Modal>
  );
}
