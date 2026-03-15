import { useState, useMemo, useEffect } from 'react'
import Layout from './components/layout/Layout'
import { useInventory } from './hooks/useInventory'
import { useFirestore } from './hooks/useFirestore'
import { useAlerts } from './hooks/useAlerts'
import DashboardPage from './pages/DashboardPage'
import InventoryPage from './pages/InventoryPage'
import PantryPage from './pages/PantryPage'
import ShoppingPage from './pages/ShoppingPage'
import MaintenancePage from './pages/MaintenancePage'
import LoansPage from './pages/LoansPage'
import ReportsPage from './pages/ReportsPage'
import SettingsPage from './pages/SettingsPage'
import WarrantiesPage from './pages/WarrantiesPage'
import ProjectsPage from './pages/ProjectsPage'
import UtilitiesPage from './pages/UtilitiesPage'
import ContractorsPage from './pages/ContractorsPage'

function daysUntil(dateStr) {
  if (!dateStr) return null
  const diff = new Date(dateStr) - new Date()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

function sendNotification(title, body) {
  if (typeof Notification === 'undefined') return
  if (Notification.permission !== 'granted') return
  try {
    new Notification(title, { body, icon: '/favicon.ico' })
  } catch {
    // ignore
  }
}

export default function App({ user }) {
  const [activePage, setActivePage] = useState('dashboard')
  const uid = user?.uid

  // Global data hooks
  const { items, getStats, add: addItem } = useInventory(uid)
  const { data: maintenance } = useFirestore(uid, 'maintenance_tasks')
  const { data: loans } = useFirestore(uid, 'loans')
  const { add: logActivity } = useFirestore(uid, 'activity_log')

  const stats = useMemo(() => getStats(), [getStats])
  const { alerts, alertsByPage } = useAlerts({ items, maintenance, loans })

  // Push notification checks on mount / when data loads
  useEffect(() => {
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return
    if (!items?.length && !maintenance?.length) return

    // Check items expiring within 7 days
    const expiringItems = items.filter((item) => {
      const d = daysUntil(item.expiryDate || item.warrantyExpiry)
      return d !== null && d >= 0 && d <= 7
    })
    if (expiringItems.length > 0) {
      sendNotification(
        `⚠️ HomeVault: ${expiringItems.length} item${expiringItems.length > 1 ? 's' : ''} expiring soon`,
        expiringItems.slice(0, 3).map((i) => i.name).join(', ') + (expiringItems.length > 3 ? '…' : '')
      )
    }

    // Check maintenance tasks due within 3 days
    const dueSoon = (maintenance || []).filter((t) => {
      if (t.status === 'done') return false
      const d = daysUntil(t.nextDue || t.dueDate)
      return d !== null && d >= 0 && d <= 3
    })
    if (dueSoon.length > 0) {
      sendNotification(
        `🔧 HomeVault: ${dueSoon.length} maintenance task${dueSoon.length > 1 ? 's' : ''} due soon`,
        dueSoon.slice(0, 3).map((t) => t.title || t.name).join(', ') + (dueSoon.length > 3 ? '…' : '')
      )
    }
  }, [items, maintenance])

  const handleQuickAdd = async (data) => {
    await addItem(data)
    await logActivity({ action: 'add', description: `Quick added: ${data.name}`, itemName: data.name })
  }

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return (
          <DashboardPage
            user={user}
            stats={stats}
            alerts={alerts}
            onNavigate={setActivePage}
            onQuickAdd={handleQuickAdd}
          />
        )
      case 'inventory':
        return <InventoryPage user={user} />
      case 'pantry':
        return <PantryPage user={user} />
      case 'shopping':
        return <ShoppingPage user={user} />
      case 'maintenance':
        return <MaintenancePage user={user} />
      case 'loans':
        return <LoansPage user={user} />
      case 'reports':
        return <ReportsPage user={user} />
      case 'settings':
        return <SettingsPage user={user} />
      case 'warranties':
        return <WarrantiesPage user={user} />
      case 'projects':
        return <ProjectsPage user={user} />
      case 'utilities':
        return <UtilitiesPage user={user} />
      case 'contractors':
        return <ContractorsPage user={user} />
      default:
        return <DashboardPage user={user} stats={stats} alerts={alerts} onNavigate={setActivePage} onQuickAdd={handleQuickAdd} />
    }
  }

  return (
    <Layout
      activePage={activePage}
      onNavigate={setActivePage}
      alertsByPage={alertsByPage}
      alertCount={alerts.length}
      user={user}
    >
      {renderPage()}
    </Layout>
  )
}
