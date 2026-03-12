import { useState, useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './firebase'
import AuthScreen from './components/auth/AuthScreen'
import App from './App'
import LoadingSpinner from './components/common/LoadingSpinner'

export default function Root() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setLoading(false)
    })
    return unsubscribe
  }, [])

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1e3a5f 0%, #0d9488 100%)',
        gap: 16,
      }}>
        <div style={{ fontSize: 48 }}>🏠</div>
        <LoadingSpinner size="lg" />
        <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: 500 }}>
          Loading HomeVault…
        </span>
      </div>
    )
  }

  if (!user) {
    return <AuthScreen />
  }

  return <App user={user} />
}
