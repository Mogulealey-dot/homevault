import { useState, useRef, useCallback } from 'react'
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage'
import { storage } from '../../firebase'
import styles from './PhotoUpload.module.css'

const MAX_PHOTOS = 5

export default function PhotoUpload({ uid, photos = [], onChange }) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef(null)

  const uploadFile = async (file) => {
    if (photos.length >= MAX_PHOTOS) return
    const ext = file.name.split('.').pop()
    const uuid = crypto.randomUUID()
    const storageRef = ref(storage, `users/${uid}/photos/${uuid}_${file.name}`)
    const uploadTask = uploadBytesResumable(storageRef, file)

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          setProgress(Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100))
        },
        reject,
        async () => {
          const url = await getDownloadURL(uploadTask.snapshot.ref)
          resolve({ url, path: storageRef.fullPath, name: file.name })
        }
      )
    })
  }

  const handleFiles = useCallback(
    async (files) => {
      const fileArr = Array.from(files).slice(0, MAX_PHOTOS - photos.length)
      if (!fileArr.length) return
      setUploading(true)
      setProgress(0)
      try {
        const results = []
        for (const file of fileArr) {
          const result = await uploadFile(file)
          if (result) results.push(result)
        }
        onChange([...photos, ...results])
      } catch (err) {
        console.error('Upload error:', err)
      } finally {
        setUploading(false)
        setProgress(0)
      }
    },
    [photos, onChange, uid]
  )

  const handleRemove = async (index) => {
    const photo = photos[index]
    if (photo.path) {
      try {
        await deleteObject(ref(storage, photo.path))
      } catch {}
    }
    onChange(photos.filter((_, i) => i !== index))
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    handleFiles(e.dataTransfer.files)
  }

  return (
    <div className={styles.root}>
      <div className={styles.previews}>
        {photos.map((photo, i) => (
          <div key={i} className={styles.preview}>
            <img src={photo.url || photo} alt={`Photo ${i + 1}`} className={styles.previewImg} />
            <button className={styles.removeBtn} onClick={() => handleRemove(i)} type="button" title="Remove">
              ×
            </button>
          </div>
        ))}
        {photos.length < MAX_PHOTOS && (
          <div
            className={`${styles.dropzone} ${dragOver ? styles.dragOver : ''} ${uploading ? styles.uploading : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => !uploading && fileInputRef.current?.click()}
          >
            {uploading ? (
              <div className={styles.uploadProgress}>
                <div className={styles.progressRing} />
                <span>{progress}%</span>
              </div>
            ) : (
              <>
                <span className={styles.uploadIcon}>📷</span>
                <span className={styles.uploadText}>
                  {dragOver ? 'Drop photo here' : 'Add photo'}
                </span>
                <span className={styles.uploadSub}>{photos.length}/{MAX_PHOTOS}</span>
              </>
            )}
          </div>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: 'none' }}
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  )
}
