export default function StatusBadge({ isPresent }) {
  return <span className={`badge ${isPresent ? "present" : "absent"}`}>{isPresent ? "Present" : "Absent"}</span>;
}
