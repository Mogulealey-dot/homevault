import { useState } from 'react'
import { useFirestore } from '../hooks/useFirestore'
import styles from './ProjectsPage.module.css'

const STATUS_LABELS = {
  planning: { label: 'Planning', cls: 'badge' },
  in_progress: { label: 'In Progress', cls: 'badge badge-warning' },
  completed: { label: 'Completed', cls: 'badge badge-success' },
  on_hold: { label: 'On Hold', cls: 'badge badge-danger' },
}

const DEFAULT_FORM = {
  name: '',
  description: '',
  status: 'planning',
  budget: '',
  spent: '',
  startDate: '',
  endDate: '',
  contractor: '',
  notes: '',
}

function formatCurrency(val) {
  const n = parseFloat(val)
  if (isNaN(n)) return '$0'
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
}

function formatDate(str) {
  if (!str) return '—'
  return new Date(str).toLocaleDateString()
}

export default function ProjectsPage({ user }) {
  const uid = user?.uid
  const { data: projects, loading, add, update, remove } = useFirestore(uid, 'projects')
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState(DEFAULT_FORM)
  const [taskInputs, setTaskInputs] = useState({})

  const openAdd = () => {
    setEditItem(null)
    setForm(DEFAULT_FORM)
    setShowModal(true)
  }

  const openEdit = (p) => {
    setEditItem(p)
    setForm({
      name: p.name || '',
      description: p.description || '',
      status: p.status || 'planning',
      budget: p.budget || '',
      spent: p.spent || '',
      startDate: p.startDate || '',
      endDate: p.endDate || '',
      contractor: p.contractor || '',
      notes: p.notes || '',
    })
    setShowModal(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    const payload = {
      ...form,
      budget: parseFloat(form.budget) || 0,
      spent: parseFloat(form.spent) || 0,
    }
    if (editItem) {
      await update(editItem.id, payload)
    } else {
      await add({ ...payload, tasks: [] })
    }
    setShowModal(false)
    setEditItem(null)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  const toggleTask = async (project, taskIdx) => {
    const tasks = [...(project.tasks || [])]
    tasks[taskIdx] = { ...tasks[taskIdx], done: !tasks[taskIdx].done }
    await update(project.id, { tasks })
  }

  const addTask = async (project) => {
    const text = (taskInputs[project.id] || '').trim()
    if (!text) return
    const tasks = [...(project.tasks || []), { text, done: false }]
    await update(project.id, { tasks })
    setTaskInputs((prev) => ({ ...prev, [project.id]: '' }))
  }

  const totalBudget = projects.reduce((s, p) => s + (parseFloat(p.budget) || 0), 0)
  const totalSpent = projects.reduce((s, p) => s + (parseFloat(p.spent) || 0), 0)
  const inProgress = projects.filter((p) => p.status === 'in_progress').length

  if (loading) return <div className={styles.root}><p>Loading…</p></div>

  return (
    <div className={styles.root}>
      <div className="page-header">
        <div>
          <div className="page-title">🏗️ Projects</div>
          <div className="page-sub">{projects.length} total projects</div>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>+ New Project</button>
      </div>

      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{projects.length}</div>
          <div className={styles.statLabel}>Total Projects</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{inProgress}</div>
          <div className={styles.statLabel}>In Progress</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{formatCurrency(totalSpent)}</div>
          <div className={styles.statLabel}>Total Spent</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{formatCurrency(totalBudget)}</div>
          <div className={styles.statLabel}>Total Budget</div>
        </div>
      </div>

      {projects.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>🏗️</div>
          <div className={styles.emptyText}>No projects yet</div>
          <div className={styles.emptyDesc}>Add your first home improvement project.</div>
        </div>
      ) : (
        <div className={styles.grid}>
          {projects.map((p) => {
            const budget = parseFloat(p.budget) || 0
            const spent = parseFloat(p.spent) || 0
            const pct = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0
            const over = spent > budget && budget > 0
            const statusInfo = STATUS_LABELS[p.status] || STATUS_LABELS.planning
            const tasks = p.tasks || []
            const doneTasks = tasks.filter((t) => t.done).length

            return (
              <div key={p.id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <div>
                    <div className={styles.projectName}>{p.name}</div>
                    <span className={statusInfo.cls}>{statusInfo.label}</span>
                  </div>
                  <div className={styles.cardActions}>
                    <button className={styles.iconBtn} onClick={() => openEdit(p)}>✏️</button>
                    <button className={`${styles.iconBtn} ${styles.delete}`} onClick={() => remove(p.id)}>🗑️</button>
                  </div>
                </div>

                {p.description && <div className={styles.description}>{p.description}</div>}

                <div className={styles.cardMeta}>
                  <div className={styles.metaItem}>Start<span>{formatDate(p.startDate)}</span></div>
                  <div className={styles.metaItem}>End<span>{formatDate(p.endDate)}</span></div>
                  {p.contractor && <div className={styles.metaItem} style={{ gridColumn: '1/-1' }}>Contractor<span>{p.contractor}</span></div>}
                </div>

                {budget > 0 && (
                  <div className={styles.budgetSection}>
                    <div className={styles.budgetRow}>
                      <span className={styles.budgetLabel}>Budget</span>
                      <span className={styles.budgetAmount}>{formatCurrency(spent)} / {formatCurrency(budget)}</span>
                    </div>
                    <div className={styles.progressBar}>
                      <div className={`${styles.progressFill} ${over ? styles.over : ''}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )}

                <div className={styles.tasksSection}>
                  <div className={styles.tasksHeader}>
                    <span>Tasks</span>
                    <span>{doneTasks}/{tasks.length} done</span>
                  </div>
                  {tasks.map((t, i) => (
                    <div key={i} className={styles.taskItem}>
                      <input type="checkbox" checked={!!t.done} onChange={() => toggleTask(p, i)} />
                      <span className={t.done ? styles.taskDone : ''}>{t.text}</span>
                    </div>
                  ))}
                  <div className={styles.addTaskRow}>
                    <input
                      className={styles.addTaskInput}
                      placeholder="Add a task…"
                      value={taskInputs[p.id] || ''}
                      onChange={(e) => setTaskInputs((prev) => ({ ...prev, [p.id]: e.target.value }))}
                      onKeyDown={(e) => e.key === 'Enter' && addTask(p)}
                    />
                    <button className={styles.addTaskBtn} onClick={() => addTask(p)}>+</button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showModal && (
        <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className={styles.modal}>
            <div className={styles.modalTitle}>{editItem ? 'Edit Project' : 'New Project'}</div>
            <form onSubmit={handleSave}>
              <div className={styles.formGrid}>
                <div className={`${styles.formGroup} ${styles.full}`}>
                  <label>Project Name *</label>
                  <input name="name" value={form.name} onChange={handleChange} required placeholder="e.g. Kitchen Remodel" />
                </div>
                <div className={`${styles.formGroup} ${styles.full}`}>
                  <label>Description</label>
                  <textarea name="description" value={form.description} onChange={handleChange} placeholder="What's this project about?" />
                </div>
                <div className={styles.formGroup}>
                  <label>Status</label>
                  <select name="status" value={form.status} onChange={handleChange}>
                    <option value="planning">Planning</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="on_hold">On Hold</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Contractor</label>
                  <input name="contractor" value={form.contractor} onChange={handleChange} placeholder="Contractor name" />
                </div>
                <div className={styles.formGroup}>
                  <label>Budget ($)</label>
                  <input type="number" name="budget" value={form.budget} onChange={handleChange} min="0" step="0.01" placeholder="0.00" />
                </div>
                <div className={styles.formGroup}>
                  <label>Spent ($)</label>
                  <input type="number" name="spent" value={form.spent} onChange={handleChange} min="0" step="0.01" placeholder="0.00" />
                </div>
                <div className={styles.formGroup}>
                  <label>Start Date</label>
                  <input type="date" name="startDate" value={form.startDate} onChange={handleChange} />
                </div>
                <div className={styles.formGroup}>
                  <label>End Date</label>
                  <input type="date" name="endDate" value={form.endDate} onChange={handleChange} />
                </div>
                <div className={`${styles.formGroup} ${styles.full}`}>
                  <label>Notes</label>
                  <textarea name="notes" value={form.notes} onChange={handleChange} placeholder="Additional notes…" />
                </div>
              </div>
              <div className={styles.modalActions}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editItem ? 'Save Changes' : 'Create Project'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
