import Modal from './Modal'
import styles from './ConfirmDialog.module.css'

export default function ConfirmDialog({
  isOpen,
  title = 'Are you sure?',
  message,
  onConfirm,
  onCancel,
  danger = false,
  confirmLabel = 'Confirm',
  loading = false,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={title} size="sm">
      <div className={styles.body}>
        {message && <p className={styles.message}>{message}</p>}
        <div className={styles.actions}>
          <button className="btn btn-secondary" onClick={onCancel} disabled={loading}>
            Cancel
          </button>
          <button
            className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Please wait…' : danger ? (confirmLabel === 'Confirm' ? 'Delete' : confirmLabel) : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  )
}
