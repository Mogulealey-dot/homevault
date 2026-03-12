import { useState, useEffect, useCallback } from 'react'
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
  getDoc,
} from 'firebase/firestore'
import { db } from '../firebase'

export function useFirestore(uid, collectionName) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!uid || !collectionName) {
      setLoading(false)
      return
    }

    const colRef = collection(db, 'users', uid, collectionName)
    const q = query(colRef, orderBy('createdAt', 'desc'))

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const docs = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
          // Convert Firestore timestamps to ISO strings for easier handling
          createdAt: d.data().createdAt?.toDate?.()?.toISOString() ?? d.data().createdAt,
          updatedAt: d.data().updatedAt?.toDate?.()?.toISOString() ?? d.data().updatedAt,
        }))
        setData(docs)
        setLoading(false)
      },
      (err) => {
        console.error(`Firestore error (${collectionName}):`, err)
        setError(err.message)
        setLoading(false)
      }
    )

    return unsubscribe
  }, [uid, collectionName])

  const add = useCallback(
    async (docData) => {
      if (!uid) return null
      const colRef = collection(db, 'users', uid, collectionName)
      const docRef = await addDoc(colRef, {
        ...docData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
      return docRef.id
    },
    [uid, collectionName]
  )

  const update = useCallback(
    async (id, changes) => {
      if (!uid) return
      const docRef = doc(db, 'users', uid, collectionName, id)
      await updateDoc(docRef, {
        ...changes,
        updatedAt: serverTimestamp(),
      })
    },
    [uid, collectionName]
  )

  const remove = useCallback(
    async (id) => {
      if (!uid) return
      const docRef = doc(db, 'users', uid, collectionName, id)
      await deleteDoc(docRef)
    },
    [uid, collectionName]
  )

  const getById = useCallback(
    async (id) => {
      if (!uid) return null
      const docRef = doc(db, 'users', uid, collectionName, id)
      const snap = await getDoc(docRef)
      if (!snap.exists()) return null
      return { id: snap.id, ...snap.data() }
    },
    [uid, collectionName]
  )

  return { data, loading, error, add, update, remove, getById }
}
