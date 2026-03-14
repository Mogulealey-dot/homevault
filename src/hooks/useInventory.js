import { useCallback } from 'react'
import { useFirestore } from './useFirestore'
import { daysUntil } from '../utils/formatters'
import { LOW_STOCK_THRESHOLD, EXPIRY_WARNING_DAYS } from '../config/constants'

export function useInventory(uid) {
  const { data: items, loading, error, add, update, remove, getById } = useFirestore(uid, 'items')

  // useCallback is correct for memoizing functions (useMemo is for memoizing values)
  const getByCategory = useCallback(
    (catId) => items.filter((i) => i.category === catId),
    [items]
  )

  const getByLocation = useCallback(
    (locId) => items.filter((i) => i.location === locId),
    [items]
  )

  const getExpiringSoon = useCallback(
    (days = EXPIRY_WARNING_DAYS) =>
      items.filter((i) => {
        if (!i.expiryDate) return false
        const d = daysUntil(i.expiryDate)
        return d !== null && d <= days
      }),
    [items]
  )

  const getLowStock = useCallback(
    (threshold = LOW_STOCK_THRESHOLD) =>
      items.filter((i) => typeof i.quantity === 'number' && i.quantity <= threshold),
    [items]
  )

  // Single pass through items — getStats is the source of truth
  const getStats = useCallback(
    () => {
      const byCategory = {}
      const byLocation = {}
      let totalValue = 0

      for (const item of items) {
        // Category counts
        if (item.category) {
          byCategory[item.category] = byCategory[item.category] || { count: 0, value: 0 }
          byCategory[item.category].count++
          const val = parseFloat(item.currentValue || item.purchasePrice || 0)
          byCategory[item.category].value += val * parseFloat(item.quantity || 1)
        }

        // Location counts
        if (item.location) {
          byLocation[item.location] = byLocation[item.location] || { count: 0, value: 0 }
          byLocation[item.location].count++
        }

        const val = parseFloat(item.currentValue || item.purchasePrice || 0)
        totalValue += val * parseFloat(item.quantity || 1)
      }

      const expiringItems = items.filter((i) => {
        if (!i.expiryDate) return false
        const d = daysUntil(i.expiryDate)
        return d !== null && d <= EXPIRY_WARNING_DAYS
      })

      const lowStockItems = items.filter(
        (i) => typeof i.quantity === 'number' && i.quantity <= LOW_STOCK_THRESHOLD
      )

      return {
        totalItems: items.length,
        totalValue,
        byCategory,
        byLocation,
        locationCount: Object.keys(byLocation).length,
        lowStockCount: lowStockItems.length,
        expiringCount: expiringItems.length,
      }
    },
    [items]
  )

  // Reuses getStats to avoid a second full loop over items
  const getTotalValue = useCallback(
    () => getStats().totalValue,
    [getStats]
  )

  const searchItems = useCallback(
    (query) => {
      if (!query || query.trim() === '') return items
      const q = query.toLowerCase()
      return items.filter(
        (i) =>
          i.name?.toLowerCase().includes(q) ||
          i.brand?.toLowerCase().includes(q) ||
          i.description?.toLowerCase().includes(q) ||
          i.model?.toLowerCase().includes(q) ||
          i.serialNumber?.toLowerCase().includes(q) ||
          (Array.isArray(i.tags) && i.tags.some((t) => t.toLowerCase().includes(q)))
      )
    },
    [items]
  )

  return {
    items,
    loading,
    error,
    add,
    update,
    remove,
    getById,
    getByCategory,
    getByLocation,
    getExpiringSoon,
    getLowStock,
    getTotalValue,
    getStats,
    searchItems,
  }
}
