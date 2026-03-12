# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Important Rule
**Always push to the GitHub repository after every change.** The site is hosted and deployed directly from this repo (`https://github.com/Mogulealey-dot/homevault`).

## Commands

```bash
npm install          # Install dependencies
npm run dev          # Start dev server at http://localhost:5173
npm run build        # Production build → dist/
npm run preview      # Preview production build locally
```

## Firebase Setup

Copy `.env.example` → `.env` and fill in your Firebase project credentials. Create a Firebase project with:
- Authentication (Email/Password + Google)
- Firestore Database
- Storage

## Architecture

**HomeVault** is a comprehensive home inventory management system built with React 19 + Vite 5 (plain JSX, no TypeScript), backed by Firebase (Auth + Firestore + Storage).

### Entry Points
- `src/main.jsx` → mounts `Root`
- `src/Root.jsx` → auth gate (shows `AuthScreen` or `App`)
- `src/App.jsx` → main shell with sidebar, routes between pages via `activePage` state
- `src/pages/*Page.jsx` → one page component per section

### Data Layer
All data lives in Firestore under `users/{uid}/{collection}`:

| Collection | Contents |
|---|---|
| `items` | All inventory items (home goods, food, electronics, etc.) |
| `shopping_list` | Shopping list items |
| `maintenance_tasks` | Scheduled and completed maintenance |
| `loans` | Items lent out or borrowed |
| `locations` | User-defined rooms/storage locations |
| `meal_plan` | 7-day meal planner entries |
| `activity_log` | Audit log of all actions |
| `settings` | User preferences (budget, notification thresholds) |

`useFirestore(uid, collectionName)` in `src/hooks/useFirestore.js` provides real-time `onSnapshot` subscriptions + CRUD for any collection.

### Key Hooks
- `useAuth()` — Firebase auth state, signIn, signUp, signOut, Google auth
- `useFirestore(uid, col)` — real-time CRUD for any Firestore collection
- `useInventory(uid)` — wraps useFirestore('items') with computed helpers (search, stats, expiry, low stock)
- `useAlerts(uid)` — cross-collection alert computation (returns array of alert objects)

### Config
- `src/config/categories.js` — 15 item categories with icons, colors, subcategories
- `src/config/constants.js` — thresholds, app name, API URL, currencies, units

### External APIs
- **Open Food Facts** (`https://world.openfoodfacts.org/api/v2/product/{barcode}.json`) — free barcode lookup for food items
- **html5-qrcode** — camera-based barcode/QR scanning in browser
- **Firebase Storage** — photo + document uploads at `users/{uid}/photos/` and `users/{uid}/docs/`

### Feature Modules
| Section | Key Components | Firestore Collection |
|---|---|---|
| Dashboard | StatsRow, AlertsPanel, ValueByCategory, RecentActivity | reads all |
| Inventory | ItemCard, ItemForm, BarcodeScanner, CategoryBrowser, LocationTree | `items`, `locations` |
| Pantry | PantryGrid, ExpiryTracker, MealPlanner, RecipeSuggestions | `items` (isFood=true), `meal_plan` |
| Shopping | ShoppingList, BudgetTracker | `shopping_list`, `settings` |
| Maintenance | MaintenanceSchedule, ServiceHistory, MaintenanceForm | `maintenance_tasks` |
| Loans | LoanTracker, LoanForm | `loans` |
| Reports | InsuranceReport, ValueSummary, ExportPanel | `items` (read-only) |
| Settings | ProfileSettings, LocationSettings, FamilySettings, NotificationSettings | `locations`, `settings` |

### PDF & Export
- `src/utils/exportPDF.js` — jspdf + jspdf-autotable for insurance and inventory PDFs
- `src/utils/exportCSV.js` — papaparse for CSV export/import
- QR labels: `src/components/common/QRLabel.jsx` using react-qr-code
