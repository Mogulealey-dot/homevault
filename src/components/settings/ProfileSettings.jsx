import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { CURRENCIES } from '../../config/constants'
import styles from './ProfileSettings.module.css'

export default function ProfileSettings({ user }) {
  const { updateProfile } = useAuth()
  const [displayName, setDisplayName] = useState(user?.displayName || '')
  const [householdName, setHouseholdName] = useState('')
  const [currency, setCurrency] = useState('USD')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const initials = displayName
    ? displayName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : user?.email?.[0]?.toUpperCase() || 'U'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await updateProfile({ displayName })
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err.message || 'Failed to update profile.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.root}>
      <div className={styles.avatarSection}>
        <div className={styles.avatar}>
          {user?.photoURL ? <img src={user.photoURL} alt="avatar" /> : initials}
        </div>
        <div className={styles.avatarInfo}>
          <div className={styles.avatarName}>{user?.displayName || 'My Household'}</div>
          <div className={styles.avatarEmail}>{user?.email}</div>
        </div>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}
      {success && <div className={styles.successMsg} style={{ marginBottom: 16 }}>✓ Profile updated successfully!</div>}

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.grid2}>
          <div className="field">
            <label>Display Name</label>
            <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your name" />
          </div>
          <div className="field">
            <label>Email</label>
            <input type="email" value={user?.email || ''} disabled style={{ opacity: 0.7, cursor: 'not-allowed' }} />
          </div>
        </div>

        <div className={styles.grid2}>
          <div className="field">
            <label>Household Name</label>
            <input type="text" value={householdName} onChange={(e) => setHouseholdName(e.target.value)} placeholder="e.g. The Smith Household" />
          </div>
          <div className="field">
            <label>Default Currency</label>
            <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>{c.symbol} {c.label} ({c.code})</option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.actions}>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving…' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  )
}
