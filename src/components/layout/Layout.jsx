import { useState } from 'react'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import styles from './Layout.module.css'

export default function Layout({
  activePage,
  onNavigate,
  alertsByPage,
  alertCount,
  user,
  children,
}) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className={styles.root}>
      <Sidebar
        activePage={activePage}
        onNavigate={onNavigate}
        alertsByPage={alertsByPage}
        user={user}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />
      <div className={styles.main}>
        <Topbar
          activePage={activePage}
          onHamburger={() => setMobileOpen(true)}
          alertCount={alertCount}
          user={user}
          onNavigate={onNavigate}
        />
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  )
}
