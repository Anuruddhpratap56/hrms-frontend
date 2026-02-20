export default function PaginationControls({ page, pages, onPageChange }) {
  return (
    <div className="pagination">
      <button className="btn btn-secondary" onClick={() => onPageChange(page - 1)} disabled={page <= 1}>Previous</button>
      <span>Page {page} of {pages}</span>
      <button className="btn btn-secondary" onClick={() => onPageChange(page + 1)} disabled={page >= pages}>Next</button>
    </div>
  );
}
