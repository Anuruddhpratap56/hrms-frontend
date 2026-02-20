const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://hrms-backend-1-7yuz.onrender.com";

function toQuery(params) {
  const searchParams = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.append(key, value);
    }
  });
  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options
  });

  if (!response.ok) {
    let detail = "Request failed";
    try {
      const data = await response.json();
      detail = data?.detail || data?.message || detail;
    } catch {
      detail = `Request failed with status ${response.status}`;
    }
    throw new Error(detail);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export async function createEmployee(payload) {
  return request("/api/v1/employees", { method: "POST", body: JSON.stringify(payload) });
}

export async function getEmployees(params) {
  return request(`/api/v1/employees${toQuery(params)}`);
}

export async function deleteEmployee(employeeId) {
  return request(`/api/v1/employees/${employeeId}`, { method: "DELETE" });
}

export async function toggleAttendance(payload) {
  return request("/api/v1/attendance", { method: "POST", body: JSON.stringify(payload) });
}

export async function getEmployeeAttendance(employeeId, params) {
  return request(`/api/v1/attendance/${employeeId}${toQuery(params)}`);
}

export async function getAllAttendance(params) {
  return request(`/api/v1/attendance${toQuery(params)}`);
}

export function startKeepAlive(intervalMs = 6000) {
  const ping = () => {
    fetch(`${API_BASE_URL}/api/v1/employees?size=1`, { method: "GET" }).catch(
      () => {}
    );
  };

  ping();
  const intervalId = setInterval(ping, intervalMs);
  return () => clearInterval(intervalId);
}

export function normalizePage(data) {
  return {
    items: data?.items || [],
    total: data?.total || 0,
    page: data?.page || 1,
    size: data?.size || 10,
    pages: data?.pages || 1
  };
}
