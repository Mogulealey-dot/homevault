import Papa from 'papaparse'
import { formatDate, formatCurrency } from './formatters'
import { getCategoryLabel } from '../config/categories'

export function exportItemsCSV(items) {
  const rows = items.map((i) => ({
    Name: i.name || '',
    Brand: i.brand || '',
    Model: i.model || '',
    Category: getCategoryLabel(i.category),
    Subcategory: i.subcategory || '',
    Location: i.location || '',
    Container: i.container || '',
    Quantity: i.quantity ?? '',
    Unit: i.unit || '',
    Condition: i.condition || '',
    'Serial Number': i.serialNumber || '',
    Barcode: i.barcode || '',
    'Purchase Price': i.purchasePrice ?? '',
    'Current Value': i.currentValue ?? '',
    'Replacement Value': i.replacementValue ?? '',
    'Purchase Date': formatDate(i.purchaseDate),
    'Purchase Location': i.purchaseLocation || '',
    'Warranty Expiry': formatDate(i.warrantyExpiry),
    'Expiry Date': formatDate(i.expiryDate),
    Tags: Array.isArray(i.tags) ? i.tags.join(', ') : '',
    Notes: i.description || '',
    'Created At': formatDate(i.createdAt),
  }))

  const csv = Papa.unparse(rows)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `HomeVault_Items_${new Date().toISOString().split('T')[0]}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function exportShoppingListText(items) {
  const lines = ['HomeVault — Shopping List', `Generated: ${new Date().toLocaleString()}`, '']
  const grouped = {}
  for (const item of items) {
    const cat = item.category || 'Other'
    if (!grouped[cat]) grouped[cat] = []
    grouped[cat].push(item)
  }

  for (const [cat, catItems] of Object.entries(grouped)) {
    lines.push(`== ${cat} ==`)
    for (const item of catItems) {
      const qty = item.quantity ? `${item.quantity} ${item.unit || ''}`.trim() : ''
      const price = item.estimatedPrice ? ` (~$${item.estimatedPrice})` : ''
      lines.push(`  [ ] ${item.name}${qty ? ' — ' + qty : ''}${price}`)
    }
    lines.push('')
  }

  const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `ShoppingList_${new Date().toISOString().split('T')[0]}.txt`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function getCSVTemplate() {
  const headers = [
    'Name', 'Brand', 'Model', 'Category', 'Subcategory', 'Location', 'Quantity', 'Unit',
    'Condition', 'Serial Number', 'Barcode', 'Purchase Price', 'Current Value',
    'Replacement Value', 'Purchase Date', 'Warranty Expiry', 'Expiry Date', 'Tags', 'Notes',
  ]
  const example = [
    'iPhone 14 Pro', 'Apple', 'A2650', 'electronics', 'Phones & Tablets', 'bedroom',
    '1', 'units', 'Excellent', 'XR123456', '', '999', '750', '999',
    '2023-01-15', '2025-01-15', '', 'phone,apple', 'Main phone',
  ]

  const csv = Papa.unparse({ fields: headers, data: [example] })
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'HomeVault_Import_Template.csv'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function parseImportCSV(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const items = results.data.map((row) => ({
          name: row['Name'] || '',
          brand: row['Brand'] || '',
          model: row['Model'] || '',
          category: row['Category']?.toLowerCase() || 'other',
          subcategory: row['Subcategory'] || '',
          location: row['Location'] || '',
          quantity: parseFloat(row['Quantity']) || 1,
          unit: row['Unit'] || 'units',
          condition: row['Condition'] || '',
          serialNumber: row['Serial Number'] || '',
          barcode: row['Barcode'] || '',
          purchasePrice: parseFloat(row['Purchase Price']) || null,
          currentValue: parseFloat(row['Current Value']) || null,
          replacementValue: parseFloat(row['Replacement Value']) || null,
          purchaseDate: row['Purchase Date'] || '',
          warrantyExpiry: row['Warranty Expiry'] || '',
          expiryDate: row['Expiry Date'] || '',
          tags: row['Tags'] ? row['Tags'].split(',').map((t) => t.trim()).filter(Boolean) : [],
          description: row['Notes'] || '',
        }))
        resolve(items)
      },
      error: reject,
    })
  })
}
