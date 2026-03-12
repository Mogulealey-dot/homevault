import { useState } from 'react'
import styles from './NotificationSettings.module.css'

const SETTINGS = [
  { id: 'foodExpiry', icon: '🍎', label: 'Food Expiry Alerts', desc: 'Alert when food items are about to expire', hasDays: true, defaultDays: 7 },
  { id: 'warrantyExpiry', icon: '🛡️', label: 'Warranty Expiry Alerts', desc: 'Alert when item warranties are expiring', hasDays: true, defaultDays: 30 },
  { id: 'lowStock', icon: '📉', label: 'Low Stock Alerts', desc: 'Alert when item quantity reaches the minimum threshold', hasDays: false },
  { id: 'maintenanceDue', icon: '🔧', label: 'Maintenance Due Alerts', desc: 'Alert when maintenance tasks are due', hasDays: true, defaultDays: 14 },
  { id: 'loanOverdue', icon: '🤝', label: 'Loan Overdue Alerts', desc: 'Alert when loaned items are overdue for return', hasDays: false },
]

export default function NotificationSettings() {
  const [settings, setSettings] = useState(() =>
    Object.fromEntries(SETTINGS.map((s) => [s.id, { enabled: true, days: s.defaultDays || null }]))
  )
  const [saved, setSaved] = useState(false)

  const toggle = (id) => setSettings((prev) => ({ ...prev, [id]: { ...prev[id], enabled: !prev[id].enabled } }))
  const setDays = (id, val) => setSettings((prev) => ({ ...prev, [id]: { ...prev[id], days: parseInt(val) || 0 } }))

  const handleSave = () => {
    // In a real app: save to Firestore user preferences
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className={styles.root}>
      <div className={styles.list}>
        {SETTINGS.map((setting) => {
          const current = settings[setting.id]
          return (
            <div key={setting.id} className={styles.item}>
              <div className={styles.left}>
                <span className={styles.icon}>{setting.icon}</span>
                <div className={styles.info}>
                  <div className={styles.label}>{setting.label}</div>
                  <div className={styles.desc}>{setting.desc}</div>
                </div>
              </div>
              <div className={styles.right}>
                {setting.hasDays && current.enabled && (
                  <>
                    <input
                      className={styles.daysInput}
                      type="number"
                      min={1}
                      max={90}
                      value={current.days || ''}
                      onChange={(e) => setDays(setting.id, e.target.value)}
                    />
                    <span className={styles.daysLabel}>days before</span>
                  </>
                )}
                <label className={styles.toggle}>
                  <input
                    type="checkbox"
                    checked={current.enabled}
                    onChange={() => toggle(setting.id)}
                  />
                  <span className={styles.slider} />
                </label>
              </div>
            </div>
          )
        })}
      </div>
      <div className={styles.saveActions}>
        {saved && <span className={styles.saved}>✓ Settings saved!</span>}
        <button className="btn btn-primary" onClick={handleSave} style={{ marginLeft: 12 }}>
          Save Settings
        </button>
      </div>
    </div>
  )
}
