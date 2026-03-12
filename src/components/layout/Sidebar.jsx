import { useAuth } from '../../hooks/useAuth'
import styles from './Sidebar.module.css'

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'inventory', label: 'Inventory', icon: '📦' },
  { id: 'pantry', label: 'Pantry & Food', icon: '🍎' },
  { id: 'shopping', label: 'Shopping List', icon: '🛒' },
  { id: 'maintenance', label: 'Maintenance', icon: '🔧' },
  { id: 'loans', label: 'Loans', icon: '🤝' },
  { id: 'reports', label: 'Reports', icon: '📋' },
]

export default function Sidebar({ activePage, onNavigate, alertsByPage = {}, user, mobileOpen, onClose }) {
  const { signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
  }

  const initials = user?.displayName
    ? user.displayName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : user?.email?.[0]?.toUpperCase() || 'U'

  return (
    <>
      {mobileOpen && <div className={styles.overlay} onClick={onClose} />}
      <aside className={`${styles.sidebar} ${mobileOpen ? styles.open : ''}`}>
        <div className={styles.logo}>
          <div className={styles.logoRow}>
            <span className={styles.logoIcon}>🏠</span>
            <span className={styles.logoText}>HomeVault</span>
          </div>
          <div className={styles.userCard}>
            <div className={styles.avatar}>
              {user?.photoURL ? (
                <img src={user.photoURL} alt="avatar" />
              ) : (
                initials
              )}
            </div>
            <div className={styles.userInfo}>
              <div className={styles.userName}>{user?.displayName || 'My Household'}</div>
              <div className={styles.userEmail}>{user?.email}</div>
            </div>
          </div>
        </div>

        <nav className={styles.nav}>
          <div className={styles.navSectionLabel}>Main Menu</div>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              className={`${styles.navItem} ${activePage === item.id ? styles.active : ''}`}
              onClick={() => { onNavigate(item.id); onClose?.() }}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              <span className={styles.navLabel}>{item.label}</span>
              {alertsByPage[item.id] > 0 && (
                <span className={styles.alertBadge}>{alertsByPage[item.id]}</span>
              )}
            </button>
          ))}
        </nav>

        <div className={styles.bottom}>
          <button
            className={`${styles.navItem} ${activePage === 'settings' ? styles.active : ''}`}
            onClick={() => { onNavigate('settings'); onClose?.() }}
          >
            <span className={styles.navIcon}>⚙️</span>
            <span className={styles.navLabel}>Settings</span>
          </button>
          <button className={styles.signOutBtn} onClick={handleSignOut}>
            <span className={styles.navIcon}>🚪</span>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  )
}
