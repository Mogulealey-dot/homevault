import { useEffect, useRef, useState } from 'react'
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from 'html5-qrcode'
import { lookupBarcode } from '../../utils/openFoodFacts'
import styles from './BarcodeScanner.module.css'

export default function BarcodeScanner({ onConfirm, onCancel }) {
  const [scanning, setScanning] = useState(true)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const scannerRef = useRef(null)
  const containerRef = useRef(null)

  useEffect(() => {
    if (!scanning) return

    const scanner = new Html5QrcodeScanner(
      'qr-reader',
      {
        fps: 10,
        qrbox: { width: 250, height: 150 },
        rememberLastUsedCamera: true,
        supportedScanTypes: [],
        formatsToSupport: [
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.QR_CODE,
        ],
      },
      false
    )

    scannerRef.current = scanner

    scanner.render(
      async (decodedText) => {
        scanner.clear().catch(() => {})
        setScanning(false)
        setLoading(true)
        setError('')
        try {
          const product = await lookupBarcode(decodedText)
          setResult(product || { barcode: decodedText, name: '', brand: '' })
        } catch {
          setResult({ barcode: decodedText, name: '', brand: '' })
        } finally {
          setLoading(false)
        }
      },
      (err) => {
        // ignore scan errors
      }
    )

    return () => {
      scanner.clear().catch(() => {})
    }
  }, [scanning])

  const handleRescan = () => {
    setResult(null)
    setError('')
    setScanning(true)
  }

  const handleConfirm = () => {
    if (result) onConfirm(result)
  }

  return (
    <div className={styles.root}>
      {scanning && (
        <>
          <div className={styles.status}>📷 Point camera at barcode or QR code</div>
          <div className={styles.scanArea}>
            <div id="qr-reader" ref={containerRef} />
          </div>
          <button className="btn btn-secondary btn-sm" onClick={onCancel} type="button">
            Cancel
          </button>
        </>
      )}

      {loading && (
        <div className={styles.loading}>
          <div className={styles.spinner} />
          Looking up product…
        </div>
      )}

      {result && !loading && (
        <>
          <div className={styles.result}>
            {result.photo ? (
              <img src={result.photo} alt={result.name} className={styles.resultPhoto} />
            ) : (
              <div className={styles.resultPhotoPlaceholder}>🍎</div>
            )}
            <div className={styles.resultInfo}>
              <div className={styles.resultName}>{result.name || '(Unknown product)'}</div>
              {result.brand && <div className={styles.resultBrand}>{result.brand}</div>}
              <div className={styles.resultBarcode}>Barcode: {result.barcode}</div>
              <div className={styles.actions}>
                <button className="btn btn-primary btn-sm" onClick={handleConfirm} type="button">
                  ✓ Use This Product
                </button>
                <button className="btn btn-secondary btn-sm" onClick={handleRescan} type="button">
                  Rescan
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {error && <div className={styles.error}>{error}</div>}
    </div>
  )
}
