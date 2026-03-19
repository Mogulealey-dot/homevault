import { useState, useEffect } from 'react'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile as firebaseUpdateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
} from 'firebase/auth'
import { auth } from '../firebase'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const signIn = async (email, password) => {
    return signInWithEmailAndPassword(auth, email, password)
  }

  const signUp = async (email, password, name) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    if (name) {
      await firebaseUpdateProfile(cred.user, { displayName: name })
    }
    return cred
  }

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider()
    return signInWithPopup(auth, provider)
  }

  const signOut = async () => {
    return firebaseSignOut(auth)
  }

  const updateProfile = async (updates) => {
    if (!auth.currentUser) return
    return firebaseUpdateProfile(auth.currentUser, updates)
  }

  const resetPassword = async (email) => {
    return sendPasswordResetEmail(auth, email)
  }

  return { user, loading, signIn, signUp, signOut, signInWithGoogle, updateProfile, resetPassword }
}
