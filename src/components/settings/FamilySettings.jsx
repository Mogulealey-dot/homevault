import { useState } from 'react'
import styles from './FamilySettings.module.css'

export default function FamilySettings({ user }) {
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('editor')
  const [inviting, setInviting] = useState(false)
  const [inviteMsg, setInviteMsg] = useState('')

  const members = [
    {
      id: user?.uid,
      name: user?.displayName || 'You',
      email: user?.email,
      role: 'owner',
      isCurrentUser: true,
    },
  ]

  const handleInvite = (e) => {
    e.preventDefault()
    if (!inviteEmail.trim()) return
    setInviting(true)
    // In a real app, this would send an invite via Firebase or your backend
    setTimeout(() => {
      setInviteMsg(`Invite sent to ${inviteEmail}`)
      setInviteEmail('')
      setInviting(false)
      setTimeout(() => setInviteMsg(''), 4000)
    }, 800)
  }

  const initials = (name) => name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || 'U'

  return (
    <div className={styles.root}>
      <div className={styles.memberList}>
        {members.map((member) => (
          <div key={member.id} className={styles.member}>
            <div className={styles.avatar}>{initials(member.name)}</div>
            <div className={styles.info}>
              <div className={styles.name}>{member.name} {member.isCurrentUser && '(You)'}</div>
              <div className={styles.email}>{member.email}</div>
            </div>
            <span className={`${styles.roleBadge} ${styles['role' + member.role.charAt(0).toUpperCase() + member.role.slice(1)]}`}>
              {member.role}
            </span>
          </div>
        ))}
      </div>

      <div className={styles.inviteSection}>
        <div className={styles.inviteTitle}>Invite Household Member</div>
        <form onSubmit={handleInvite}>
          <div className={styles.inviteRow}>
            <input
              className={styles.inviteInput}
              type="email"
              placeholder="Enter email address"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
            />
            <select className={styles.roleSelect} value={inviteRole} onChange={(e) => setInviteRole(e.target.value)}>
              <option value="editor">Editor</option>
              <option value="viewer">Viewer</option>
            </select>
            <button type="submit" className="btn btn-primary btn-sm" disabled={inviting}>
              {inviting ? 'Sending…' : 'Invite'}
            </button>
          </div>
        </form>
        {inviteMsg && (
          <div className="alert alert-success" style={{ marginTop: 10 }}>✓ {inviteMsg}</div>
        )}
        <p style={{ marginTop: 10, fontSize: 12, color: 'var(--muted)' }}>
          Note: Full multi-user collaboration requires Firestore security rules configuration.
        </p>
      </div>
    </div>
  )
}
