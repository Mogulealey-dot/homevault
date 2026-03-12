import { useState, useMemo } from 'react'
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
