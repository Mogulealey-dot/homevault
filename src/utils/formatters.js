import { format, formatDistanceToNow, parseISO, differenceInDays, isValid } from 'date-fns'

export function formatCurrency(amount, currency = 'USD') {
  if (amount === null || amount === undefined || isNaN(amount)) return '—'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(dateStr) {
  if (!dateStr) return '—'
  try {
    const d = typeof dateStr === 'string' ? parseISO(dateStr) : new Date(dateStr)
    if (!isValid(d)) return '—'
    return format(d, 'MMM d, yyyy')
  } catch {
    return '—'
  }
}

export function formatRelativeDate(dateStr) {
  if (!dateStr) return '—'
  try {
    const d = typeof dateStr === 'string' ? parseISO(dateStr) : new Date(dateStr)
    if (!isValid(d)) return '—'
    const diff = differenceInDays(d, new Date())
    if (diff === 0) return 'today'
    if (diff === 1) return 'tomorrow'
    if (diff === -1) return 'yesterday'
    if (diff > 0) return `in ${diff} days`
    return `${Math.abs(diff)} days ago`
  } catch {
    return '—'
  }
}

export function formatRelativeTime(dateStr) {
  if (!dateStr) return '—'
  try {
    const d = typeof dateStr === 'string' ? parseISO(dateStr) : new Date(dateStr)
    if (!isValid(d)) return '—'
    return formatDistanceToNow(d, { addSuffix: true })
  } catch {
    return '—'
  }
}

export function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

export function daysUntil(dateStr) {
  if (!dateStr) return null
  try {
    const d = typeof dateStr === 'string' ? parseISO(dateStr) : new Date(dateStr)
    if (!isValid(d)) return null
    return differenceInDays(d, new Date())
  } catch {
    return null
  }
}

export function formatQuantity(qty, unit) {
  if (qty === null || qty === undefined) return '—'
  const u = unit || 'units'
  return `${qty} ${u}`
}

export function truncate(str, len = 50) {
  if (!str) return ''
  if (str.length <= len) return str
  return str.slice(0, len) + '…'
}

export function formatPhoneNumber(phone) {
  if (!phone) return ''
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
  }
  return phone
}

export function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}
