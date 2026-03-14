import { useMemo } from 'react'
import { daysUntil } from '../utils/formatters'
import {
  EXPIRY_WARNING_DAYS,
  LOW_STOCK_THRESHOLD,
  MAINTENANCE_WARNING_DAYS,
  WARRANTY_WARNING_DAYS,
} from '../config/constants'

export function useAlerts({ items = [], maintenance = [], loans = [] }) {
  const alerts = useMemo(() => {
    const result = []

    // Food expiry alerts
    for (const item of items) {
      if (item.expiryDate) {
        const days = daysUntil(item.expiryDate)
        if (days !== null && days <= EXPIRY_WARNING_DAYS) {
          result.push({
            id: `expiry-${item.id}`,
            type: 'expiry',
            // days < 0 = already expired (danger), 0 = today (danger), 1-3 = very soon (warning), 4+ = upcoming (info)
            severity: days < 0 ? 'danger' : days === 0 ? 'danger' : days <= 3 ? 'warning' : 'info',
            title: days <= 0 ? `${item.name} has expired` : `${item.name} expiring soon`,
            description:
              days === 0
                ? 'Expires today'
                : days < 0
                ? `Expired ${Math.abs(days)} day${Math.abs(days) !== 1 ? 's' : ''} ago`
                : `Expires in ${days} day${days !== 1 ? 's' : ''}`,
            itemId: item.id,
            actionLabel: 'View Item',
            page: 'pantry',
          })
        }
      }

      // Low stock alerts
      if (typeof item.quantity === 'number' && item.quantity <= LOW_STOCK_THRESHOLD) {
        result.push({
          id: `lowstock-${item.id}`,
          type: 'lowstock',
          severity: item.quantity === 0 ? 'danger' : 'warning',
          title: item.quantity === 0 ? `${item.name} is out of stock` : `${item.name} is low`,
          description: `Only ${item.quantity} ${item.unit || 'units'} remaining`,
          itemId: item.id,
          actionLabel: 'Add to Shopping',
          page: 'shopping',
        })
      }

      // Warranty expiry alerts
      if (item.warrantyExpiry) {
        const days = daysUntil(item.warrantyExpiry)
        if (days !== null && days >= 0 && days <= WARRANTY_WARNING_DAYS) {
          result.push({
            id: `warranty-${item.id}`,
            type: 'warranty',
            severity: days <= 7 ? 'danger' : 'warning',
            title: `${item.name} warranty expiring`,
            description: `Warranty expires in ${days} day${days !== 1 ? 's' : ''}`,
            itemId: item.id,
            actionLabel: 'View Item',
            page: 'inventory',
          })
        }
      }
    }

    // Maintenance alerts
    for (const task of maintenance) {
      if (task.scheduledDate && task.status !== 'done') {
        const days = daysUntil(task.scheduledDate)
        if (days !== null && days <= MAINTENANCE_WARNING_DAYS) {
          result.push({
            id: `maintenance-${task.id}`,
            type: 'maintenance',
            severity: days <= 0 ? 'danger' : 'warning',
            title:
              days <= 0
                ? `Overdue: ${task.title}`
                : `Maintenance due: ${task.title}`,
            description:
              days <= 0
                ? `Was due ${Math.abs(days)} day${Math.abs(days) !== 1 ? 's' : ''} ago`
                : `Due in ${days} day${days !== 1 ? 's' : ''}`,
            itemId: task.itemId,
            taskId: task.id,
            actionLabel: 'View Task',
            page: 'maintenance',
          })
        }
      }
    }

    // Loan alerts (overdue)
    for (const loan of loans) {
      if (loan.returnDate && loan.status !== 'returned') {
        const days = daysUntil(loan.returnDate)
        if (days !== null && days <= 0) {
          result.push({
            id: `loan-${loan.id}`,
            type: 'loan',
            severity: 'warning',
            title: `Overdue loan: ${loan.itemName}`,
            description: `${loan.direction === 'lend' ? 'Lent to' : 'Borrowed from'} ${loan.personName} — overdue by ${Math.abs(days)} day${Math.abs(days) !== 1 ? 's' : ''}`,
            itemId: loan.itemId,
            loanId: loan.id,
            actionLabel: 'View Loan',
            page: 'loans',
          })
        }
      }
    }

    // Sort: danger first, then by type
    result.sort((a, b) => {
      if (a.severity === 'danger' && b.severity !== 'danger') return -1
      if (b.severity === 'danger' && a.severity !== 'danger') return 1
      return 0
    })

    return result
  }, [items, maintenance, loans])

  const alertsByPage = useMemo(() => {
    const map = {}
    for (const alert of alerts) {
      if (!map[alert.page]) map[alert.page] = 0
      map[alert.page]++
    }
    return map
  }, [alerts])

  return { alerts, alertsByPage }
}
