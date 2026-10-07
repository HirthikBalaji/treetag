# TreeTag — Digital Tree Registry & Biodiversity Intelligence Platform

**TreeTag** is a production-grade, full-stack geospatial platform designed for university sustainability cells, municipal urban forestry departments, environmental NGOs, and student field teams (e.g. MAHI Club) to systematically document, monitor, and manage trees with **sub-meter geographic precision, photographic evidence, botanical taxonomy, dendrometric measurements, arboricultural health diagnostics, and an immutable audit trail**.

---

## 🌲 Core Architecture & Tech Stack

- **Framework**: Next.js 14+ (App Router, Server Actions, Dynamic API Route Handlers)
- **Language**: TypeScript 5.7+
- **Database & GIS**: PostgreSQL 15+ with WGS84 Spatial Coordinate Indexing (`latitude`, `longitude`, bounding boxes, Haversine Great-Circle distance engine)
- **ORM**: Prisma Client v5.22
- **Interactive Mapping**: MapLibre GL JS with Vector/Raster layers (Carto Voyager Streets, Esri World Imagery Satellite, Carto Dark Matter), custom SVG health-classified canopy markers, clustering, and interactive pin placement
- **Charts & Visualizations**: Recharts with Simpson Diversity Index calculation and canopy area computations
- **Styling & UI**: Tailwind CSS, Environmental Forest Palette (`#166534`, `#22c55e`, `#84cc16`), Lucide Icons, Full Dark Mode
- **Animations & Microinteractions**: Framer Motion & Canvas Confetti
- **Validation**: Zod schema validation on all inputs and API endpoints
- **Authentication**: JWT HTTP-only session cookies with password hashing via BCrypt and multi-tier RBAC (Admin, Project Manager, Surveyor, Viewer)
- **Offline & Mobile Engine**: Client-side storage queue, high-contrast Field Mode terminal, and background sync

---

## 🗺️ Key Features

### 1. 7-Step Guided Field Survey Registration
Do not overwhelm users in the field with a massive monolithic form:
- **Step 1 — Photographic Evidence & Geolocation**: Camera capture / file dropzone, browser Geolocation API with accuracy indicator (±Xm), and interactive map pin adjuster.
- **Step 2 — Botanical Taxonomical Identification**: Verified database-driven species autocomplete, family, genus, native provenance indicator, and AI computer vision observation suggestions.
- **Step 3 — Dendrometric Dimensions**: Height (m), circumference (cm), automatic DBH calculation ($DBH = \frac{C}{\pi}$), canopy spread, and estimated age slider.
- **Step 4 — Health & Structural Risk**: Crown vigor rating (Healthy 🟢, Good 🟢, Moderate 🟡, Poor 🟠, Critical 🔴), trunk bark condition, foliage state, pest/disease presence, and public risk tier.
- **Step 5 — Environmental Context**: Soil substrate, sunlight exposure, water catchment, and surrounding urban infrastructure.
- **Step 6 — Care & Maintenance Scheduling**: Irrigation, pruning, fertilization, bio-pest control, guy-wire support flags, and recurring inspection calendar.
- **Step 7 — Review & Submit**: Comprehensive verification card and celebration animation.

### 2. Interactive GIS Canopy Map
- MapLibre GL JS engine with Streets, Satellite (Esri World Imagery), and Dark mode toggle.
- Health-color-coded custom tree canopy markers (pulsing rings for critical trees).
- Live popup cards displaying tree code, species, health, coordinates, and direct links to dossiers.
- Interactive click-to-pin and drag-marker mode for field surveys.

### 3. Tree Registry Split View
- Instant debounced multi-facet search (Tree ID, common name, scientific name, notes).
- Filter by species, botanical family, health condition, risk level, survey project, and inspection status.
- **Split View Mode**: Synchronized Tree list on the left and GIS map on the right — selecting a tree centers and highlights it on the map; selecting a map marker scrolls and highlights the table row.
- Full data table view with pagination and sorting.

### 4. Dedicated Mobile Field Mode (`/field`)
- High-contrast sunlight-readable interface with extra-large touch targets.
- 30-second rapid log workflow: GPS Lock → Camera Snap → Species Tap → Health Tap → Commit.
- Offline queue monitoring and manual "Sync Now" trigger.

### 5. Automated Biodiversity Intelligence & Analytics (`/analytics`)
- Species abundance bar chart and survey trajectory line charts.
- **Simpson Diversity Index** ($1 - \frac{\sum n(n-1)}{N(N-1)}$) calculated live.
- Indigenous native species coverage percentage and computed canopy shade area ($m^2$).
- Field surveyor contribution leaderboard.

### 6. GIS Interoperability & Spatial Exports
- **Spatial GeoJSON (`/api/export/geojson`)**: Valid GeoJSON `FeatureCollection` with Point geometry and complete properties for import into QGIS, ArcGIS Pro, and CAD software.
- **CSV Data Table (`/api/export/csv`)**: Complete tabular export with proper column headers and quotation escaping.

### 7. Governance, Audit Trails, and Teams (`/activity`, `/admin`, `/projects`)
- Multi-tier projects (e.g. *Campus Tree Survey 2026*, *Chennai Biodiversity Corridor*).
- Complete immutable audit log of every creation, photo upload, inspection, and health update.
- 1-Click Role Testing Switcher (Admin, Project Manager, Surveyor, Viewer) for demonstrations.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (tested on Node v22.23)
- PostgreSQL 14+ (running locally on port 5432)

### 1. Clone & Install
```bash
git clone <repo-url>
cd GeoTagging
npm install
```

### 2. Environment Configuration
Create a `.env` file in the project root:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/treetag_db?schema=public"
JWT_SECRET="treetag_production_super_secure_jwt_secret_key_2026_geotagging"
NEXT_PUBLIC_APP_NAME="TreeTag"
NEXT_PUBLIC_APP_SUBTITLE="Digital Tree Registry & Biodiversity Intelligence Platform"
NEXT_PUBLIC_DEFAULT_LAT=13.0827
NEXT_PUBLIC_DEFAULT_LNG=80.2707
NEXT_PUBLIC_DEFAULT_ZOOM=14
```

### 3. Database Initialization & Seeding
Push the Prisma schema to PostgreSQL and seed 56 realistic trees with rich botanical metadata:
```bash
# Push schema to PostgreSQL
npm run db:push

# Seed species, users, projects, trees, photos, inspections, and audit logs
npm run db:seed
```

### 4. Run Development Server
```bash
npm run dev
# Open http://localhost:3000
```

### 5. Run Production Build & Test
```bash
# Execute unit & geospatial tests
npm test

# Build optimized production bundle
npm run build

# Start production server
npm start
```

---

## 👥 Demo User Credentials

The database is pre-seeded with 4 roles for instant evaluation. You can log in using credentials or use the **1-Click Demo Switcher** directly in the top-right user menu:

| Role | Name | Email | Password |
|---|---|---|---|
| **Admin** | Hirthik Sharma | `admin@treetag.org` | `password123` |
| **Project Manager** | Dr. Sunita Rao | `pm@treetag.org` | `password123` |
| **Field Surveyor** | Arjun Patel | `arjun@treetag.org` | `password123` |
| **Public Viewer** | Ananya Iyer | `viewer@treetag.org` | `password123` |

---

## 📡 REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/login` | Authenticate and set HTTP-only JWT session cookie |
| `POST` | `/api/auth/register` | Register a new user |
| `GET` | `/api/auth/me` | Fetch active user session |
| `POST` | `/api/auth/logout` | Terminate session |
| `GET` | `/api/trees` | List trees with multi-facet filters & bounding box |
| `POST` | `/api/trees` | Register a new tree specimen with audit log |
| `GET` | `/api/trees/:id` | Get full tree dossier with photos, inspections & history |
| `PATCH` | `/api/trees/:id` | Update tree attributes |
| `DELETE` | `/api/trees/:id` | Delete tree specimen (Admin/PM only) |
| `POST` | `/api/trees/:id/photos` | Upload/attach photograph to specimen |
| `POST` | `/api/trees/:id/inspections`| Submit recurring arborist inspection |
| `POST` | `/api/trees/:id/maintenance`| Log maintenance event (watering, pruning, etc.) |
| `GET` | `/api/projects` | List active survey projects |
| `POST` | `/api/projects` | Create a new survey project boundary |
| `GET` | `/api/species` | Search botanical taxonomical species catalogue |
| `GET` | `/api/analytics` | Aggregate biodiversity intelligence metrics & charts |
| `GET` | `/api/activity` | System audit trail & modification log |
| `GET` | `/api/export/geojson` | Export dataset as standard GIS GeoJSON |
| `GET` | `/api/export/csv` | Export dataset as CSV table |

---

## 🗺️ GeoJSON Sample Output

Exported via `/api/export/geojson`:
```json
{
  "type": "FeatureCollection",
  "metadata": {
    "platform": "TreeTag Digital Tree Registry",
    "crs": "EPSG:4326"
  },
  "features": [
    {
      "type": "Feature",
      "id": "TR-000001",
      "geometry": {
        "type": "Point",
        "coordinates": [80.2707, 13.0827, 14.0]
      },
      "properties": {
        "treeCode": "TR-000001",
        "commonName": "Neem",
        "scientificName": "Azadirachta indica",
        "family": "Meliaceae",
        "nativeStatus": true,
        "healthStatus": "HEALTHY",
        "riskLevel": "LOW",
        "height": 14.5,
        "dbh": 27.1,
        "canopyWidth": 8.0,
        "projectName": "Campus Tree Survey 2026"
      }
    }
  ]
}
```

---

## 🧪 Testing

Run native Node.js tests:
```bash
npm test
```
Verifies:
- Haversine Great-Circle distance formula
- Coordinate DMS formatting
- GeoJSON FeatureCollection structure
- DBH calculation from circumference
- Zod schema validation boundaries (-90 to 90 lat, -180 to 180 lng)

---

## 🌿 License
Developed for collaborative urban forestry, sustainability departments, and environmental conservation teams. Distributed under the MIT License.
