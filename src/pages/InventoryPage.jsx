import { useState, useMemo } from 'react'
import { useInventory } from '../hooks/useInventory'
import { useFirestore } from '../hooks/useFirestore'
import ItemCard from '../components/inventory/ItemCard'
import ItemModal from '../components/inventory/ItemModal'
import ItemForm from '../components/inventory/ItemForm'
import CategoryBrowser from '../components/inventory/CategoryBrowser'
import LocationTree from '../components/inventory/LocationTree'
import SearchFilter from '../components/common/SearchFilter'
import Modal from '../components/common/Modal'
import ConfirmDialog from '../components/common/ConfirmDialog'
import EmptyState from '../components/common/EmptyState'
import LoadingSpinner from '../components/common/LoadingSpinner'
import LoanForm from '../components/loans/LoanForm'
import { parseImportCSV } from '../utils/exportCSV'
import styles from './InventoryPage.module.css'

export default function InventoryPage({ user }) {
  const uid = user?.uid
  const { items, loading, add, update, remove, getStats, searchItems } = useInventory(uid)
  const { data: locations, add: addLocation, remove: removeLocation, update: updateLocations } = useFirestore(uid, 'locations')

  const [view, setView] = useState('grid')
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [activeFilters, setActiveFilters] = useState({})
  const [searchQuery, setSearchQuery] = useState('')
  const [editItem, setEditItem] = useState(null)
  const [viewItem, setViewItem] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [loanItem, setLoanItem] = useState(null)
  const { add: addLoan } = useFirestore(uid, 'loans')
  const { add: logActivity } = useFirestore(uid, 'activity_log')

  const stats = useMemo(() => getStats(), [getStats])

  const itemCounts = useMemo(() => {
    const counts = {}
    for (const item of items) {
      if (item.category) counts[item.category] = (counts[item.category] || 0) + 1
    }
    return counts
  }, [items])

  const locationCounts = useMemo(() => {
    const counts = {}
    for (const item of items) {
      if (item.location) counts[item.location] = (counts[item.location] || 0) + 1
    }
    return counts
  }, [items])

  const filtered = useMemo(() => {
    let result = searchQuery ? searchItems(searchQuery) : items
    if (selectedCategory) result = result.filter((i) => i.category === selectedCategory)
    if (selectedLocation) result = result.filter((i) => i.location === selectedLocation)
    if (activeFilters.category) result = result.filter((i) => i.category === activeFilters.category)
    if (activeFilters.location) result = result.filter((i) => i.location === activeFilters.location)
    if (activeFilters.condition) result = result.filter((i) => i.condition === activeFilters.condition)
    return result
  }, [items, searchQuery, selectedCategory, selectedLocation, activeFilters, searchItems])

  const handleAdd = async (data) => {
    const id = await add(data)
    await logActivity({ action: 'add', description: `Added: ${data.name}`, itemName: data.name })
    setShowAddForm(false)
    return id
  }

  const handleUpdate = async (id, data) => {
    await update(id, data)
    await logActivity({ action: 'update', description: `Updated: ${data.name || ''}`, itemName: data.name })
    setViewItem(null)
  }

  const handleDelete = async (item) => {
    await remove(deleteTarget?.id || item?.id)
    await logActivity({ action: 'delete', description: `Deleted: ${deleteTarget?.name || item?.name}` })
    setDeleteTarget(null)
    setViewItem(null)
  }

  const handleLend = async (data) => {
    await addLoan(data)
    await logActivity({ action: 'loan', description: `Lent: ${data.itemName} to ${data.personName}` })
    setLoanItem(null)
  }

  const handleAddLocation = async (locData) => {
    await addLocation(locData)
  }

  const handleDeleteLocation = async (loc) => {
    await removeLocation(loc.id)
  }

  if (loading) return <LoadingSpinner fullPage />

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarSection}>
          <div className={styles.sidebarLabel}>Categories</div>
          <CategoryBrowser
            selectedCategory={selectedCategory}
            onSelect={setSelectedCategory}
            itemCounts={itemCounts}
          />
        </div>
        <div className={styles.sidebarSection}>
          <div className={styles.sidebarLabel}>Locations</div>
          <LocationTree
            locations={locations}
            selectedLocation={selectedLocation}
            onSelect={setSelectedLocation}
            onAddLocation={handleAddLocation}
            onDeleteLocation={handleDeleteLocation}
            itemCounts={locationCounts}
          />
        </div>
      </aside>

      <div className={styles.main}>
        <div className={styles.mainHeader}>
          <div className={styles.mainHeaderLeft}>
            <SearchFilter
              onSearch={setSearchQuery}
              onFilter={setActiveFilters}
              activeFilters={activeFilters}
              locations={locations.length > 0 ? locations : []}
            />
          </div>
          <div className={styles.viewToggle}>
            <button className={`${styles.viewBtn} ${view === 'grid' ? styles.active : ''}`} onClick={() => setView('grid')}>⊞</button>
            <button className={`${styles.viewBtn} ${view === 'list' ? styles.active : ''}`} onClick={() => setView('list')}>≡</button>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => setShowAddForm(true)}>
            + Add Item
          </button>
        </div>

        <div className={styles.count}>
          {filtered.length} of {items.length} items
          {(selectedCategory || selectedLocation || searchQuery) && ' (filtered)'}
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding: '0 24px' }}>
            <EmptyState
              icon="📦"
              title={items.length === 0 ? 'No items yet' : 'No items match your filters'}
              description={items.length === 0 ? 'Start building your home inventory.' : 'Try adjusting your search or filters.'}
              action={items.length === 0 ? { label: '+ Add First Item', onClick: () => setShowAddForm(true) } : undefined}
            />
          </div>
        ) : (
          <div className={view === 'grid' ? styles.grid : styles.listView}>
            {filtered.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onEdit={(i) => setViewItem(i)}
                onDelete={(i) => setDeleteTarget(i)}
                onViewQR={(i) => setViewItem(i)}
                onLend={(i) => setLoanItem(i)}
              />
            ))}
          </div>
        )}
      </div>

      <button className={styles.fab} onClick={() => setShowAddForm(true)} title="Add item">
        +
      </button>

      {/* Add item modal */}
      <Modal isOpen={showAddForm} onClose={() => setShowAddForm(false)} title="Add New Item" size="xl">
        <ItemForm uid={uid} locations={locations} onSave={handleAdd} onCancel={() => setShowAddForm(false)} />
      </Modal>

      {/* View/edit modal */}
      <ItemModal
        item={viewItem}
        isOpen={!!viewItem}
        onClose={() => setViewItem(null)}
        onSave={handleUpdate}
        onDelete={(i) => { setDeleteTarget(i); setViewItem(null) }}
        uid={uid}
        locations={locations}
      />

      {/* Delete confirm */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Item"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This cannot be undone.`}
        onConfirm={() => handleDelete(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
        danger
      />

      {/* Lend modal */}
      <Modal isOpen={!!loanItem} onClose={() => setLoanItem(null)} title="Lend Item" size="md">
        <LoanForm
          initialData={{ itemId: loanItem?.id, itemName: loanItem?.name, direction: 'lend' }}
          items={items}
          onSave={handleLend}
          onCancel={() => setLoanItem(null)}
        />
      </Modal>
    </div>
  )
}
