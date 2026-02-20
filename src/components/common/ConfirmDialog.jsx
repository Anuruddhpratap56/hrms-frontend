import Modal from "./Modal";

export default function ConfirmDialog({ isOpen, title, text, onConfirm, onCancel }) {
  return (
    <Modal isOpen={isOpen} title={title} onClose={onCancel}>
      <p className="dialog-text">{text}</p>
      <div className="actions-row">
        <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
        <button className="btn btn-danger" onClick={onConfirm}>Delete</button>
      </div>
    </Modal>
  );
}
