import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import styles from './Topbar.module.css'

const PAGE_TITLES = {
  dashboard: 'Dashboard',
  inventory: 'Inventory',
  pantry: 'Pantry & Food',
  shopping: 'Shopping List',
  maintenance: 'Maintenance',
  loans: 'Loans',
  reports: 'Reports',
  settings: 'Settings',
}

export default function Topbar({ activePage, onHamburger, alertCount = 0, user, onNavigate, onGlobalSearch }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)
  const { signOut } = useAuth()

  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const initials = user?.displayName
    ? user.displayName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : user?.email?.[0]?.toUpperCase() || 'U'

  return (
    <header className={styles.topbar}>
      <button className={styles.hamburger} onClick={onHamburger} aria-label="Open menu">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 12h18M3 6h18M3 18h18"/>
        </svg>
      </button>

      <div className={styles.pageTitle}>{PAGE_TITLES[activePage] || activePage}</div>

      <div className={styles.searchWrap}>
        <svg className={styles.searchIcon} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
        </svg>
        <input
          className={styles.searchInput}
          type="text"
          placeholder="Search anything…"
          onChange={(e) => onGlobalSearch?.(e.target.value)}
        />
      </div>

      <div className={styles.actions}>
        <button
          className={styles.notifBtn}
          onClick={() => onNavigate?.('dashboard')}
          title={`${alertCount} alerts`}
        >
          🔔
          {alertCount > 0 && <span className={styles.notifBadge}>{alertCount > 9 ? '9+' : alertCount}</span>}
        </button>

        <div style={{ position: 'relative' }} ref={menuRef}>
          <button className={styles.avatarBtn} onClick={() => setMenuOpen(!menuOpen)}>
            {user?.photoURL ? <img src={user.photoURL} alt="avatar" /> : initials}
          </button>
          {menuOpen && (
            <div className={styles.dropdown}>
              <button className={styles.dropdownItem} onClick={() => { onNavigate?.('settings'); setMenuOpen(false) }}>
                ⚙️ Settings
              </button>
              <div className={styles.dropdownDivider} />
              <button className={`${styles.dropdownItem} ${styles.danger}`} onClick={() => signOut()}>
                🚪 Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
