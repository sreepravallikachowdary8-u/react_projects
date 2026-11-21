# RESCUENET – Complete Disaster Management & Emergency Response Web Application
> *"Every Second Matters. Every Life Counts."*

**RESCUENET** is a modern, fully responsive Disaster Management and Emergency Response Web Platform connecting citizens, rescue personnel, emergency medical/fire services, safe shelters, and municipal command centers during extreme crises (Floods, Fires, Earthquakes, Cyclones, Accidents, Structural Collapses, and Medical Emergencies).

---

## 🌟 Key Highlights & Capabilities

- **Centrally Synchronized State (React Context API + LocalStorage)**:
  - When a **Citizen** activates the emergency SOS beacon, it instantly appears across **Admin Command Center** and **Rescue Responder** dispatch queues in real time without refreshing.
  - When an **Admin** assigns a rescue squad, the citizen's live tracking view and the squad's mission console update immediately.
  - When a **Rescue Squad** marks on-scene progress (*Assigned → Rescue → Resolved*), the audit trail updates across all devices.
- **Iconic Pulsing Emergency SOS Beacon**:
  - High-visibility central red beacon with pulsing radar ring, siren indicator, and multi-step distress broadcast modal.
  - Real browser hardware GPS coordinates via `navigator.geolocation` API with accuracy rating, manual fallback, and clear distinction between browser GPS vs. sample coordinates.
- **Full Interactive Leaflet / OpenStreetMap Visualizer**:
  - Multi-layer toggle overlays for Citizen GPS locations, SOS Incidents, Squad vehicles, Shelters, Hospitals, Police/Fire Stations, Hazard reports, and Blocked roadways.
  - Custom HTML DivIcon markers with situational SVG badges and popups.
- **Dedicated SOS Rescue Mission Tracking Page**:
  - Full request metadata, live tactical map, reporting citizen contacts, and a visual 4-stage operational progress timeline (*New → Assigned → Rescue → Resolved*).
  - Built-in interactive lifecycle simulation triggers for testing.
- **Role-Based Command Dashboards**:
  - **Citizen Portal**: Mobile-first layout with SOS beacon, active status card, safe place finder, hazard reporting with photo uploads, emergency contacts manager, and survival guides.
  - **Rescue Responder Console**: Mission acceptance workflow, squad availability toggle (*Available / Busy / Offline*), tactical field map, on-scene status updater, and resolved mission logs.
  - **Admin Command Center**: Multi-agency overview statistics, live incident map, SOS table management, rescue squad roster with dispatch modal, civil alert broadcasts, shelter capacity management, roadway closure controls, and deep analytics charts.
- **Emergency Preparedness & Survival Knowledge Base**:
  - Step-by-step *Before, During, After* survival manual for Floods, Fires, Earthquakes, Cyclones, First Aid/CPR, and an interactive 72-hour Go-Bag checklist.

---

## 🛠️ Technology Stack

- **Framework**: React.js 19 + Vite 8
- **Language**: JavaScript (ES6+ Modules)
- **Styling**: Pure Modular CSS3 + Custom Design Tokens (No Tailwind CSS, clean semantic variables, glassmorphism, responsive grid/flexbox)
- **Routing**: React Router DOM (v7)
- **Icons**: Lucide React
- **Maps**: Leaflet + React Leaflet with OpenStreetMap Tiles
- **Charts & Intelligence**: Recharts
- **State & Persistence**: React Context API (`AuthContext`, `EmergencyContext`) + LocalStorage

---

## 🔑 Demo Accounts & Rapid Testing

The application includes an instant **One-Click Demo Switcher** at the top of every screen to test cross-role communication:

| Role | Demo Email | Password | Primary Interface |
|---|---|---|---|
| **Citizen** | `citizen@rescuenet.com` | `123456` | Citizen Home, SOS Button, Safe Havens, Hazard Reporter |
| **Rescue Team** | `rescue@rescuenet.com` | `123456` | Responder Console, Mission Queue, Status Controls |
| **Admin Command** | `admin@rescuenet.com` | `123456` | Master Command Center, Squad Dispatch, Alerts & Maps |

*(You can also register new Citizen or Rescue Responder accounts anytime from `/register`)*

---

## 🚀 Getting Started

### 1. Installation
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```

The application will be live at `http://localhost:5173/` (or next open port e.g. `http://localhost:5174/`).

### 3. Production Build
```bash
npm run build
npm run preview
```

---

## 📂 Project Architecture

```
src/
├── assets/                  # Brand vectors & icons
├── components/              # Shared UI components
│   ├── AlertCard.jsx        # Disaster warning card with instructions
│   ├── DemoNotice.jsx       # Instant role-switch & data-reset top bar
│   ├── EmergencyCard.jsx    # Distress incident card with action triggers
│   ├── MapView.jsx          # Leaflet OpenStreetMap with custom markers
│   ├── MobileBottomNav.jsx  # Responsive bottom navigation bar
│   ├── Navbar.jsx           # Global header with live GPS pill & alerts
│   ├── NotificationPanel.jsx# Live notification popover
│   ├── ProtectedRoute.jsx   # Role-guarded route wrapper
│   ├── ShelterCard.jsx      # Safe haven card with capacity utilization
│   ├── Sidebar.jsx          # Role-aware collapsible sidebar
│   ├── SOSButton.jsx        # Central pulsing emergency distress trigger
│   ├── SOSModal.jsx         # Emergency modal with GPS and confirmation
│   ├── StatCard.jsx         # Metric indicator cards
│   └── StatusTimeline.jsx   # 4-stage visual rescue timeline
├── context/
│   ├── AuthContext.jsx      # Authentication, role switching, user profiles
│   └── EmergencyContext.jsx # Reactive global state for SOS, squads, alerts
├── data/                    # Realistic mock datasets
│   ├── mockAlerts.js        # Severe weather & civil alerts
│   ├── mockContacts.js      # Kin & emergency contact records
│   ├── mockEmergencies.js   # Flood, fire, earthquake distress calls
│   ├── mockHazards.js       # Citizen-reported roadway obstructions
│   ├── mockRoadClosures.js  # Blocked highway sectors & detours
│   ├── mockSafetyGuides.js  # Survival protocols & Go-Bag checklist
│   ├── mockServices.js      # Hospitals, trauma posts, fire stations
│   ├── mockShelters.js      # Public shelters & occupancy meters
│   ├── mockTeams.js         # Rescue squadrons, vehicles & gear
│   └── mockUsers.js         # Pre-configured demo credentials
├── pages/
│   ├── auth/                # Login & Registration views
│   ├── citizen/             # Citizen portal, SOS tracking, Safe Havens
│   ├── rescue/              # Responder dashboard, Missions, Field Map
│   └── admin/               # Command center, Dispatch tables, Analytics
├── services/
│   ├── locationService.js   # Browser Geolocation API & Haversine distance
│   └── storageService.js    # LocalStorage persistence & synchronization
├── styles/                  # Modular CSS design system
│   ├── auth.css             # Authentication card & credentials switcher
│   ├── components.css       # Modals, buttons, badges, tables, timeline
│   ├── dashboard.css        # Layouts, navbar, sidebar, grid matrices
│   ├── global.css           # Design tokens, color palette, animations
│   └── responsive.css       # Mobile bottom bar & tablet drawer queries
├── App.jsx                  # Main application routes & layout wrapper
└── main.jsx                 # Entry point mounting React DOM & Leaflet CSS
```

---

## 🛡️ License

Built for disaster management operations and emergency preparedness simulation.
*RESCUENET — Every Second Matters. Every Life Counts.*
