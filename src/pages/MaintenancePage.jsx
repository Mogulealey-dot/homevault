import { useState } from 'react'
import { useFirestore } from '../hooks/useFirestore'
import { useInventory } from '../hooks/useInventory'
import MaintenanceSchedule from '../components/maintenance/MaintenanceSchedule'
import ServiceHistory from '../components/maintenance/ServiceHistory'
import MaintenanceForm from '../components/maintenance/MaintenanceForm'
import Modal from '../components/common/Modal'
import LoadingSpinner from '../components/common/LoadingSpinner'
import styles from './MaintenancePage.module.css'

export default function MaintenancePage({ user }) {
  const uid = user?.uid
  const { data: tasks, loading, add, update, remove } = useFirestore(uid, 'maintenance_tasks')
  const { items } = useInventory(uid)
  const [activeTab, setActiveTab] = useState('schedule')
  const [showForm, setShowForm] = useState(false)
  const [editTask, setEditTask] = useState(null)

  if (loading) return <LoadingSpinner fullPage />

  const handleSave = async (data) => {
    if (editTask) {
      await update(editTask.id, data)
      setEditTask(null)
    } else {
      await add(data)
    }
    setShowForm(false)
  }

  const handleMarkDone = async (id) => {
    await update(id, {
      status: 'done',
      completedDate: new Date().toISOString().split('T')[0],
    })
  }

  const handleEdit = (task) => {
    setEditTask(task)
    setShowForm(true)
  }

  return (
    <div className={styles.root}>
      <div className="page-header">
        <div>
          <div className="page-title">🔧 Maintenance</div>
          <div className="page-sub">
            {tasks.filter((t) => t.status !== 'done').length} pending tasks
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditTask(null); setShowForm(true) }}>
          + Add Task
        </button>
      </div>

      <div className="tabs">
        <button className={`tab ${activeTab === 'schedule' ? 'active' : ''}`} onClick={() => setActiveTab('schedule')}>
          📅 Schedule
        </button>
        <button className={`tab ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
          📋 Service History
        </button>
      </div>

      {activeTab === 'schedule' && (
        <MaintenanceSchedule
          tasks={tasks}
          onMarkDone={handleMarkDone}
          onEdit={handleEdit}
          onDelete={remove}
          onAdd={() => setShowForm(true)}
        />
      )}

      {activeTab === 'history' && (
        <ServiceHistory tasks={tasks} />
      )}

      <Modal
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditTask(null) }}
        title={editTask ? 'Edit Task' : 'Add Maintenance Task'}
        size="md"
      >
        <MaintenanceForm
          initialData={editTask}
          items={items}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditTask(null) }}
        />
      </Modal>
    </div>
  )
}
