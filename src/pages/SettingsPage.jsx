import { useState } from 'react'
import { useFirestore } from '../hooks/useFirestore'
import ProfileSettings from '../components/settings/ProfileSettings'
import LocationSettings from '../components/settings/LocationSettings'
import FamilySettings from '../components/settings/FamilySettings'
import NotificationSettings from '../components/settings/NotificationSettings'
import styles from './SettingsPage.module.css'

const TABS = [
  { id: 'profile', label: '👤 Profile' },
  { id: 'locations', label: '📍 Locations' },
  { id: 'family', label: '👨‍👩‍👧 Family' },
  { id: 'notifications', label: '🔔 Notifications' },
]

export default function SettingsPage({ user }) {
  const uid = user?.uid
  const [activeTab, setActiveTab] = useState('profile')
  const { data: locations, add: addLocation, remove: removeLocation } = useFirestore(uid, 'locations')
  const { data: items } = useFirestore(uid, 'items')

  const itemCounts = {}
  for (const item of items) {
    if (item.location) itemCounts[item.location] = (itemCounts[item.location] || 0) + 1
  }

  const handleReorder = async (reordered) => {
    // Reorder is handled locally for now
    // In production: update order fields
  }

  return (
    <div className={styles.root}>
      <div className="page-header">
        <div>
          <div className="page-title">⚙️ Settings</div>
          <div className="page-sub">Manage your account and preferences</div>
        </div>
      </div>

      <div className="tabs">
        {TABS.map((t) => (
          <button key={t.id} className={`tab ${activeTab === t.id ? 'active' : ''}`} onClick={() => setActiveTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      <div className={styles.tabContent}>
        {activeTab === 'profile' && <ProfileSettings user={user} />}
        {activeTab === 'locations' && (
          <LocationSettings
            locations={locations}
            onAdd={addLocation}
            onDelete={removeLocation}
            onReorder={handleReorder}
            itemCounts={itemCounts}
          />
        )}
        {activeTab === 'family' && <FamilySettings user={user} />}
        {activeTab === 'notifications' && <NotificationSettings />}
      </div>
    </div>
  )
}
