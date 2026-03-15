import { useState, useEffect } from 'react'
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
  { id: 'household', label: '🏠 Household' },
  { id: 'push', label: '📣 Push Alerts' },
]

// ─── Household Section ────────────────────────────────────────────────────────
function HouseholdSection({ uid, settingsData, onUpdate }) {
  const householdCode = uid ? uid.slice(0, 8).toUpperCase() : '--------'
  const household = settingsData?.household || {}
  const members = household.members || []
  const [joinCode, setJoinCode] = useState('')
  const [copied, setCopied] = useState(false)
  const [joining, setJoining] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(householdCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleJoin = async (e) => {
    e.preventDefault()
    if (!joinCode.trim()) return
    setJoining(true)
    const normalizedCode = joinCode.trim().toUpperCase().slice(0, 8)
    const existing = members.find((m) => m.code === normalizedCode)
    if (!existing) {
      const updatedMembers = [...members, { code: normalizedCode, joinedAt: new Date().toISOString() }]
      await onUpdate({ household: { ...household, members: updatedMembers } })
    }
    setJoinCode('')
    setJoining(false)
  }

  const handleRemove = async (code) => {
    const updatedMembers = members.filter((m) => m.code !== code)
    await onUpdate({ household: { ...household, members: updatedMembers } })
  }

  return (
    <div style={{ maxWidth: 520 }}>
      <div style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--navy)', marginBottom: 8 }}>Your Household Code</h3>
        <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 12 }}>
          Share this code with household members so they can link to your inventory.
        </p>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{
            padding: '12px 20px', background: 'var(--bg)', border: '2px dashed var(--border)',
            borderRadius: 'var(--radius-lg)', fontFamily: 'monospace', fontSize: 22, fontWeight: 800,
            letterSpacing: '0.2em', color: 'var(--navy)', flex: 1, textAlign: 'center',
          }}>
            {householdCode}
          </div>
          <button className="btn btn-secondary" onClick={handleCopy}>
            {copied ? '✓ Copied!' : '📋 Copy'}
          </button>
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--navy)', marginBottom: 8 }}>Join a Household</h3>
        <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 12 }}>
          Enter someone's household code to link their inventory.
          <br />
          <em style={{ fontSize: 12 }}>Note: Full cross-account access requires updating Firestore security rules.</em>
        </p>
        <form onSubmit={handleJoin} style={{ display: 'flex', gap: 10 }}>
          <input
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
            placeholder="Enter 8-char code (e.g. A1B2C3D4)"
            maxLength={8}
            style={{
              flex: 1, padding: '10px 14px', border: '1px solid var(--border)', borderRadius: 'var(--radius)',
              fontSize: 14, background: 'var(--bg)', color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.1em',
            }}
          />
          <button type="submit" className="btn btn-primary" disabled={joining || !joinCode.trim()}>
            {joining ? 'Linking…' : 'Link'}
          </button>
        </form>
      </div>

      <div>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--navy)', marginBottom: 8 }}>
          Linked Members ({members.length})
        </h3>
        {members.length === 0 ? (
          <p style={{ fontSize: 13, color: 'var(--muted)', fontStyle: 'italic' }}>No linked members yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {members.map((m) => (
              <div key={m.code} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 16px', background: 'var(--bg)', borderRadius: 'var(--radius)',
                border: '1px solid var(--border)',
              }}>
                <div>
                  <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--navy)', letterSpacing: '0.1em' }}>{m.code}</span>
                  {m.joinedAt && (
                    <span style={{ fontSize: 12, color: 'var(--muted)', marginLeft: 10 }}>
                      Linked {new Date(m.joinedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <button className="btn btn-danger" style={{ fontSize: 12, padding: '5px 12px' }} onClick={() => handleRemove(m.code)}>
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Push Notifications Section ───────────────────────────────────────────────
function PushAlertsSection({ uid, settingsData, onUpdate }) {
  const [permission, setPermission] = useState(typeof Notification !== 'undefined' ? Notification.permission : 'unsupported')
  const prefs = settingsData?.pushPrefs || {}
  const [expiryDays, setExpiryDays] = useState(prefs.expiryDays ?? 7)
  const [maintenanceDays, setMaintenanceDays] = useState(prefs.maintenanceDays ?? 3)
  const [saving, setSaving] = useState(false)

  const requestPermission = async () => {
    if (typeof Notification === 'undefined') return
    const result = await Notification.requestPermission()
    setPermission(result)
  }

  const handleSave = async () => {
    setSaving(true)
    await onUpdate({
      pushPrefs: {
        ...(settingsData?.pushPrefs || {}),
        expiryDays: parseInt(expiryDays) || 7,
        maintenanceDays: parseInt(maintenanceDays) || 3,
        enabled: permission === 'granted',
      },
    })
    setSaving(false)
  }

  const permBadge = () => {
    if (permission === 'granted') return <span className="badge badge-success">Granted</span>
    if (permission === 'denied') return <span className="badge badge-danger">Denied</span>
    if (permission === 'unsupported') return <span className="badge">Not Supported</span>
    return <span className="badge badge-warning">Not Requested</span>
  }

  return (
    <div style={{ maxWidth: 520 }}>
      <div style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--navy)', marginBottom: 8 }}>Browser Notifications</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', background: 'var(--bg)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>Permission Status</div>
            <div style={{ marginTop: 4 }}>{permBadge()}</div>
          </div>
          {permission !== 'granted' && permission !== 'denied' && permission !== 'unsupported' && (
            <button className="btn btn-primary" style={{ marginLeft: 'auto' }} onClick={requestPermission}>
              Enable Notifications
            </button>
          )}
          {permission === 'denied' && (
            <p style={{ fontSize: 12, color: 'var(--crimson)', marginLeft: 'auto' }}>
              Blocked in browser settings. Please allow manually.
            </p>
          )}
          {permission === 'granted' && (
            <span style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--muted)' }}>✓ Notifications are active</span>
          )}
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--navy)', marginBottom: 14 }}>Alert Thresholds</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>Expiry / Warranty Warnings</div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>Notify when items expire within this many days</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="number"
                  value={expiryDays}
                  onChange={(e) => setExpiryDays(e.target.value)}
                  min={1}
                  max={365}
                  style={{ width: 70, padding: '6px 10px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontSize: 14, textAlign: 'center' }}
                />
                <span style={{ fontSize: 13, color: 'var(--muted)' }}>days</span>
              </div>
            </label>
          </div>
          <div>
            <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>Maintenance Reminders</div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>Notify when maintenance is due within this many days</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="number"
                  value={maintenanceDays}
                  onChange={(e) => setMaintenanceDays(e.target.value)}
                  min={1}
                  max={365}
                  style={{ width: 70, padding: '6px 10px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontSize: 14, textAlign: 'center' }}
                />
                <span style={{ fontSize: 13, color: 'var(--muted)' }}>days</span>
              </div>
            </label>
          </div>
        </div>
      </div>

      <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
        {saving ? 'Saving…' : 'Save Preferences'}
      </button>
    </div>
  )
}

export default function SettingsPage({ user }) {
  const uid = user?.uid
  const [activeTab, setActiveTab] = useState('profile')
  const { data: locations, add: addLocation, remove: removeLocation } = useFirestore(uid, 'locations')
  const { data: items } = useFirestore(uid, 'items')
  const { data: settingsArr, add: addSettings, update: updateSettings } = useFirestore(uid, 'settings')

  const settingsDoc = settingsArr?.[0]

  const handleSettingsUpdate = async (changes) => {
    if (settingsDoc?.id) {
      await updateSettings(settingsDoc.id, changes)
    } else {
      await addSettings(changes)
    }
  }

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
        {activeTab === 'household' && (
          <HouseholdSection
            uid={uid}
            settingsData={settingsDoc}
            onUpdate={handleSettingsUpdate}
          />
        )}
        {activeTab === 'push' && (
          <PushAlertsSection
            uid={uid}
            settingsData={settingsDoc}
            onUpdate={handleSettingsUpdate}
          />
        )}
      </div>
    </div>
  )
}
