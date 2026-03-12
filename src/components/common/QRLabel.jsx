import { useRef } from 'react'
import QRCode from 'react-qr-code'
import styles from './QRLabel.module.css'

export default function QRLabel({ item }) {
  const printRef = useRef(null)

  const handlePrint = () => {
    const content = printRef.current
    const win = window.open('', '_blank')
    win.document.write(`
      <html>
        <head>
          <title>QR Label — ${item.name}</title>
          <style>
            body { font-family: 'Inter', Arial, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: white; }
            .label { text-align: center; padding: 24px; border: 2px solid #e2e8f0; border-radius: 12px; max-width: 240px; }
            .name { font-size: 16px; font-weight: 700; color: #0f172a; margin-top: 12px; margin-bottom: 4px; }
            .loc { font-size: 12px; color: #64748b; margin-bottom: 4px; }
            .id { font-size: 10px; color: #94a3b8; font-family: monospace; }
            svg { display: block; margin: 0 auto; }
          </style>
        </head>
        <body>${content.innerHTML}</body>
      </html>
    `)
    win.document.close()
    win.focus()
    win.print()
    win.close()
  }

  const qrValue = JSON.stringify({ id: item.id, name: item.name, v: 1 })

  return (
    <div className={styles.root}>
      <div ref={printRef} className={styles.label}>
        <QRCode value={qrValue} size={160} />
        <div className={styles.name}>{item.name}</div>
        {item.location && <div className={styles.loc}>📍 {item.location}</div>}
        <div className={styles.id}>ID: {item.id}</div>
      </div>
      <button className="btn btn-secondary btn-sm" onClick={handlePrint} type="button">
        🖨️ Print Label
      </button>
    </div>
  )
}
