import { useState } from "react";
import Modal from "../common/Modal";

const initialState = {
  full_name: "",
  email: "",
  department: ""
};

export default function EmployeeFormModal({ isOpen, onClose, onSubmit, submitting }) {
  const [form, setForm] = useState(initialState);

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const submit = async (event) => {
    event.preventDefault();
    try {
      await onSubmit(form);
      setForm(initialState);
      onClose();
    } catch {
      return;
    }
  };

  return (
    <Modal isOpen={isOpen} title="Create Employee" onClose={onClose}>
      <form onSubmit={submit} className="form-grid">
        <label className="field">
          <span>Full Name</span>
          <input value={form.full_name} onChange={(e) => setField("full_name", e.target.value)} />
        </label>
        <label className="field">
          <span>Email</span>
          <input type="email" value={form.email} onChange={(e) => setField("email", e.target.value)} />
        </label>
        <label className="field">
          <span>Department</span>
          <input value={form.department} onChange={(e) => setField("department", e.target.value)} />
        </label>
        <div className="actions-row">
          <button className="btn btn-secondary" type="button" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" type="submit" disabled={submitting}>{submitting ? "Creating..." : "Create"}</button>
        </div>
      </form>
    </Modal>
  );
}
