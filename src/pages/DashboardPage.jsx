import StatsRow from '../components/dashboard/StatsRow'
import AlertsPanel from '../components/dashboard/AlertsPanel'
import ValueByCategory from '../components/dashboard/ValueByCategory'
import RecentActivity from '../components/dashboard/RecentActivity'
import QuickAdd from '../components/dashboard/QuickAdd'
import styles from './DashboardPage.module.css'

export default function DashboardPage({ user, stats, alerts, onNavigate, onQuickAdd }) {
  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">
            👋 Welcome back, {user?.displayName?.split(' ')[0] || 'there'}
          </div>
          <div className="page-sub">Here's an overview of your home inventory</div>
        </div>
      </div>

      <StatsRow stats={stats} alertCount={alerts?.length || 0} />

      <div className={styles['two-col']}>
        <AlertsPanel alerts={alerts} onNavigate={onNavigate} />
        <ValueByCategory stats={stats} />
      </div>

      <div className={styles['bottom-row']}>
        <RecentActivity uid={user?.uid} />
        <QuickAdd onAdd={onQuickAdd} />
      </div>
    </div>
  )
}
