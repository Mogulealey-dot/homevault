import { useState } from 'react'
import { useFirestore } from '../hooks/useFirestore'
import { useInventory } from '../hooks/useInventory'
import LoanTracker from '../components/loans/LoanTracker'
import LoanForm from '../components/loans/LoanForm'
import Modal from '../components/common/Modal'
import ConfirmDialog from '../components/common/ConfirmDialog'
import LoadingSpinner from '../components/common/LoadingSpinner'
import styles from './LoansPage.module.css'

export default function LoansPage({ user }) {
  const uid = user?.uid
  const { data: loans, loading, add, update, remove } = useFirestore(uid, 'loans')
  const { items } = useInventory(uid)
  const [showForm, setShowForm] = useState(false)
  const [editLoan, setEditLoan] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  if (loading) return <LoadingSpinner fullPage />

  const handleSave = async (data) => {
    if (editLoan) {
      await update(editLoan.id, data)
      setEditLoan(null)
    } else {
      await add(data)
    }
    setShowForm(false)
  }

  const handleMarkReturned = async (id) => {
    await update(id, { status: 'returned', returnedDate: new Date().toISOString().split('T')[0] })
  }

  const handleEdit = (loan) => {
    setEditLoan(loan)
    setShowForm(true)
  }

  return (
    <div className={styles.root}>
      <div className="page-header">
        <div>
          <div className="page-title">🤝 Loans</div>
          <div className="page-sub">
            {loans.filter((l) => l.status !== 'returned').length} active loans
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditLoan(null); setShowForm(true) }}>
          + Add Loan
        </button>
      </div>

      <LoanTracker
        loans={loans}
        onMarkReturned={handleMarkReturned}
        onEdit={handleEdit}
        onDelete={(id) => setDeleteTarget(id)}
        onAdd={() => setShowForm(true)}
      />

      <Modal
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditLoan(null) }}
        title={editLoan ? 'Edit Loan' : 'Add Loan'}
        size="md"
      >
        <LoanForm
          initialData={editLoan}
          items={items}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditLoan(null) }}
        />
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Loan"
        message="Are you sure you want to delete this loan record?"
        onConfirm={() => { remove(deleteTarget); setDeleteTarget(null) }}
        onCancel={() => setDeleteTarget(null)}
        danger
      />
    </div>
  )
}
