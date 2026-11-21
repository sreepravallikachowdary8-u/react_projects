# RESCUENET – Backend API & Real-Time WebSocket Specification
**Tagline:** *"Every Second Matters. Every Life Counts."*  
**Version:** 1.0.0 (Production Blueprint)  
**Protocol:** REST (HTTP/1.1 or HTTP/2) + WebSockets (`ws://` / `wss://`)  
**Base URL:** `https://api.rescuenet.org/api/v1` (or `http://localhost:5000/api/v1` in local dev)  

---

## 1. Architectural Conventions & Standards

### 1.1 Headers & Content Type
- **Content-Type:** `application/json` (except multipart file uploads for hazard photos: `multipart/form-data`)
- **Authorization:** `Bearer <JWT_ACCESS_TOKEN>` for protected routes
- **Accept:** `application/json`
- **X-Client-Version:** `rescuenet-web-v1.0.0`

### 1.2 Unified Success Response Schema
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Operation completed successfully.",
  "data": { ... },
  "meta": {
    "timestamp": "2026-10-05T00:30:00.000Z",
    "requestId": "req-98f24bc1-2e11"
  }
}
```

### 1.3 Unified Error Response Schema
```json
{
  "success": false,
  "statusCode": 400,
  "error": "BAD_REQUEST",
  "message": "Field 'phone' must be a valid international E.164 phone number.",
  "details": [
    { "field": "phone", "issue": "Invalid phone format" }
  ],
  "meta": {
    "timestamp": "2026-10-05T00:30:00.000Z",
    "requestId": "req-98f24bc1-2e11"
  }
}
```

### 1.4 Standard HTTP Status Codes
- `200 OK`: Successful read or update.
- `201 Created`: Resource successfully created (SOS logged, user registered, alert posted).
- `400 Bad Request`: Validation failure or malformed payload.
- `401 Unauthorized`: Missing or expired JWT.
- `403 Forbidden`: Authenticated user lacks permission (e.g. Citizen attempting to broadcast an Alert).
- `404 Not Found`: Target entity not found in database.
- `409 Conflict`: Duplicate email/phone or race condition in team assignment.
- `422 Unprocessable Entity`: Semantic logic violation.
- `500 Internal Server Error`: Unhandled server exception.

---

## 2. Authentication & User Identity (`/api/v1/auth`)

### 2.1 User Registration
- **Endpoint:** `POST /api/v1/auth/register`
- **Auth Required:** No
- **Request Body:**
```json
{
  "name": "Jane Citizen",
  "email": "jane@example.com",
  "phone": "+14155550199",
  "password": "SecurePassword123!",
  "role": "citizen" // "citizen" | "rescue"
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "User registered successfully.",
  "data": {
    "user": {
      "id": "usr-8392",
      "name": "Jane Citizen",
      "email": "jane@example.com",
      "phone": "+14155550199",
      "role": "citizen",
      "createdAt": "2026-10-05T00:30:00.000Z"
    },
    "tokens": {
      "accessToken": "eyJhbGciOi...",
      "refreshToken": "eyJhbGciOi...",
      "expiresIn": 3600
    }
  }
}
```

### 2.2 User Login
- **Endpoint:** `POST /api/v1/auth/login`
- **Auth Required:** No
- **Request Body:**
```json
{
  "email": "citizen@rescuenet.com",
  "password": "Password123!"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "user": {
      "id": "usr-demo-citizen",
      "name": "Alex Mercer",
      "email": "citizen@rescuenet.com",
      "phone": "+1 (555) 019-2831",
      "role": "citizen"
    },
    "tokens": {
      "accessToken": "eyJhbGciOi...",
      "refreshToken": "eyJhbGciOi...",
      "expiresIn": 3600
    }
  }
}
```

### 2.3 Refresh Access Token
- **Endpoint:** `POST /api/v1/auth/refresh`
- **Auth Required:** No (Refresh token provided)
- **Request Body:**
```json
{
  "refreshToken": "eyJhbGciOi..."
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOi...",
    "expiresIn": 3600
  }
}
```

### 2.4 Get Current User Profile
- **Endpoint:** `GET /api/v1/auth/me`
- **Auth Required:** Yes (`Bearer <token>`)
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "usr-demo-citizen",
    "name": "Alex Mercer",
    "email": "citizen@rescuenet.com",
    "phone": "+1 (555) 019-2831",
    "role": "citizen",
    "bloodGroup": "O+",
    "emergencyContactCount": 2,
    "createdAt": "2026-09-01T12:00:00.000Z"
  }
}
```

### 2.5 Logout
- **Endpoint:** `POST /api/v1/auth/logout`
- **Auth Required:** Yes
- **Request Body:**
```json
{
  "refreshToken": "eyJhbGciOi..."
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Session invalidated successfully."
}
```

---

## 3. Emergency SOS Operations (`/api/v1/emergencies`)

### 3.1 Trigger SOS Distress Beacon (Critical)
- **Endpoint:** `POST /api/v1/emergencies`
- **Auth Required:** Yes (Citizen or First Responder)
- **Request Body:**
```json
{
  "type": "Flood", // "Flood" | "Fire" | "Earthquake" | "Cyclone" | "Accident" | "Medical" | "Building Collapse" | "Other"
  "description": "Rising flash flood waters on 1st floor, 3 adults trapped.",
  "location": {
    "lat": 37.7749,
    "lng": -122.4194,
    "address": "742 Evergreen Terrace, Sector 4",
    "accuracy": 12.5
  },
  "severity": "Critical", // "Critical" | "High" | "Moderate" | "Low"
  "peopleCount": 3,
  "medicalRequired": true,
  "contactPhone": "+15550192831"
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "SOS distress signal dispatched to Command Center & Field Units.",
  "data": {
    "id": "SOS-94820",
    "citizenId": "usr-demo-citizen",
    "citizenName": "Alex Mercer",
    "citizenPhone": "+15550192831",
    "type": "Flood",
    "severity": "Critical",
    "status": "New", // "New" -> "Assigned" -> "Rescue" -> "Resolved"
    "location": {
      "lat": 37.7749,
      "lng": -122.4194,
      "address": "742 Evergreen Terrace, Sector 4",
      "accuracy": 12.5
    },
    "peopleCount": 3,
    "medicalRequired": true,
    "assignedTeamId": null,
    "createdAt": "2026-10-05T00:32:00.000Z",
    "timeline": [
      {
        "status": "New",
        "timestamp": "2026-10-05T00:32:00.000Z",
        "note": "Distress beacon registered via web client."
      }
    ]
  }
}
```

### 3.2 List Emergency Requests
- **Endpoint:** `GET /api/v1/emergencies`
- **Auth Required:** Yes (Admin or Rescue role)
- **Query Parameters:**
  - `status`: Filter by status (`New`, `Assigned`, `Rescue`, `Resolved`)
  - `type`: Filter by disaster type (`Flood`, `Fire`, etc.)
  - `severity`: Filter by severity (`Critical`, `High`, etc.)
  - `lat`, `lng`, `radiusKm`: Spatial proximity filter (e.g. within 25km)
  - `page`: Page index (default: `1`)
  - `limit`: Page size (default: `20`)
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "SOS-94820",
        "type": "Flood",
        "severity": "Critical",
        "status": "New",
        "location": { "lat": 37.7749, "lng": -122.4194, "address": "Sector 4" },
        "citizenName": "Alex Mercer",
        "citizenPhone": "+15550192831",
        "createdAt": "2026-10-05T00:32:00.000Z"
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 20,
      "totalPages": 1
    }
  }
}
```

### 3.3 Get Single Emergency Details
- **Endpoint:** `GET /api/v1/emergencies/:id`
- **Auth Required:** Yes
- **Response (200 OK):** Full emergency object including chronological audit events and assigned responder vehicle coordinates.

### 3.4 Assign Rescue Team to Incident
- **Endpoint:** `POST /api/v1/emergencies/:id/assign`
- **Auth Required:** Yes (Admin or Rescue Team Dispatch)
- **Request Body:**
```json
{
  "teamId": "team-alpha-1",
  "etaMinutes": 12,
  "notes": "Alpha Rapid Boat Unit deployed from Station 9."
}
```
- **Response (200 OK):** Status transitioned to `Assigned`. Dispatches push notification and WebSocket event to citizen.

### 3.5 Update Incident Operational Status
- **Endpoint:** `PATCH /api/v1/emergencies/:id/status`
- **Auth Required:** Yes (Rescue or Admin)
- **Request Body:**
```json
{
  "status": "Rescue", // "Assigned" | "Rescue" | "Resolved"
  "notes": "Team arrived at scene. Commenced swift-water evacuation."
}
```
- **Response (200 OK):** Updated incident record with appended timeline entry.

### 3.6 Resolve / Close Incident
- **Endpoint:** `POST /api/v1/emergencies/:id/resolve`
- **Auth Required:** Yes (Rescue or Admin)
- **Request Body:**
```json
{
  "resolutionSummary": "3 civilians rescued without injuries and transported to Safe Shelter #2.",
  "rescuedCount": 3,
  "casualtyCount": 0
}
```
- **Response (200 OK):** Incident marked `Resolved`. Rescue team status reverted to `Available`.

---

## 4. Rescue Teams & Responder Fleet (`/api/v1/rescue-teams`)

### 4.1 List Rescue Teams
- **Endpoint:** `GET /api/v1/rescue-teams`
- **Auth Required:** Yes
- **Query Parameters:** `status` (`Available` | `Busy` | `On Mission` | `Offline`), `specialization`
- **Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "team-alpha-1",
      "name": "Alpha Rapid Response",
      "leader": "Capt. Alex Mercer",
      "phone": "+1 (555) 902-1144",
      "specialization": "Water & Flood Rescue",
      "membersCount": 6,
      "status": "Available",
      "location": { "lat": 37.7785, "lng": -122.4150 },
      "activeIncidentId": null,
      "vehicle": "Rigid Inflatable Boat (RIB-4) + 4x4 Support Unit"
    }
  ]
}
```

### 4.2 Register / Create Rescue Team
- **Endpoint:** `POST /api/v1/rescue-teams`
- **Auth Required:** Yes (Admin only)
- **Request Body:**
```json
{
  "name": "Bravo Urban Search & Rescue",
  "leader": "Lt. Samantha Hayes",
  "phone": "+1 (555) 888-2910",
  "specialization": "Structural Collapse & K9 Search",
  "membersCount": 8,
  "baseLocation": { "lat": 37.7600, "lng": -122.4200 }
}
```

### 4.3 Update Availability Status
- **Endpoint:** `PATCH /api/v1/rescue-teams/:id/availability`
- **Auth Required:** Yes (Team Responder or Admin)
- **Request Body:**
```json
{
  "status": "Available" // "Available" | "Busy" | "On Mission" | "Offline"
}
```

### 4.4 Stream Real-Time Responder GPS Telemetry
- **Endpoint:** `POST /api/v1/rescue-teams/:id/telemetry`
- **Auth Required:** Yes (Responder token)
- **Request Body:**
```json
{
  "lat": 37.7761,
  "lng": -122.4180,
  "heading": 185.4,
  "speedKmh": 45.2,
  "batteryPercent": 92
}
```
- **Response (200 OK):** Telemetry stored and broadcast over WebSocket to dispatchers.

---

## 5. Civil Defense Alerts & Warnings (`/api/v1/alerts`)

### 5.1 Get Active Disaster Alerts
- **Endpoint:** `GET /api/v1/alerts`
- **Auth Required:** No (Public endpoint for citizen awareness)
- **Query Parameters:** `activeOnly=true`, `severity=Critical,High`, `lat`, `lng`
- **Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "ALT-2026-081",
      "title": "Severe Flash Flood Warning - Zone 4 & River Corridor",
      "type": "Flood",
      "severity": "Critical", // "Critical" | "High" | "Moderate" | "Low"
      "affectedArea": "Lowland sectors along River Valley and Highway 101",
      "coordinates": { "lat": 37.7749, "lng": -122.4194 },
      "radiusKm": 15.0,
      "instructions": "Seek high ground immediately. Do not attempt to drive through flooded roads.",
      "issuedAt": "2026-10-05T00:15:00.000Z",
      "expiresAt": "2026-10-05T12:00:00.000Z",
      "isActive": true
    }
  ]
}
```

### 5.2 Broadcast New Alert
- **Endpoint:** `POST /api/v1/alerts`
- **Auth Required:** Yes (Admin only)
- **Request Body:**
```json
{
  "title": "Cat 3 Gale Force Wind Advisory",
  "type": "Cyclone",
  "severity": "High",
  "affectedArea": "Coastal Shoreline & Bay Harbor",
  "instructions": "Secure loose structures and remain indoors away from glass facades.",
  "durationHours": 18
}
```

### 5.3 Update or Cancel Alert
- **Endpoint:** `PATCH /api/v1/alerts/:id`
- **Auth Required:** Yes (Admin only)
- **Request Body:**
```json
{
  "isActive": false,
  "cancellationNotice": "Flash flood waters have receded to safe thresholds."
}
```

---

## 6. Emergency Shelters & Safe Havens (`/api/v1/shelters`)

### 6.1 Search Nearby Shelters
- **Endpoint:** `GET /api/v1/shelters`
- **Auth Required:** No
- **Query Parameters:** `lat=37.7749&lng=-122.4194&maxDistanceKm=20`
- **Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "sh-01",
      "name": "Central High Gymnasium Evacuation Shelter",
      "address": "400 Oak St, San Francisco, CA",
      "location": { "lat": 37.7735, "lng": -122.4210 },
      "distanceKm": 0.8,
      "capacity": 250,
      "currentOccupancy": 114,
      "occupancyRate": 45.6,
      "status": "Open", // "Open" | "Full" | "Closed"
      "facilities": ["Medical Station", "Food & Clean Water", "Backup Generator", "Pet Friendly", "Restrooms"],
      "contactPhone": "+1 (555) 392-1082"
    }
  ]
}
```

### 6.2 Create Shelter Facility
- **Endpoint:** `POST /api/v1/shelters`
- **Auth Required:** Yes (Admin only)

### 6.3 Update Shelter Occupancy Rate
- **Endpoint:** `PATCH /api/v1/shelters/:id/occupancy`
- **Auth Required:** Yes (Admin or Shelter Warden)
- **Request Body:**
```json
{
  "currentOccupancy": 125
}
```

---

## 7. Hazard Reports & Field Sightings (`/api/v1/hazards`)

### 7.1 Submit Hazard Report
- **Endpoint:** `POST /api/v1/hazards`
- **Auth Required:** Yes (Citizen or Responder)
- **Format:** `multipart/form-data`
- **Fields:**
  - `type`: `Flood` | `Fallen Tree` | `Power Line Down` | `Structural Damage` | `Gas Leak`
  - `description`: Text notes
  - `lat`: Floating point coordinate
  - `lng`: Floating point coordinate
  - `address`: Text description of landmark
  - `photo`: Binary file (image/jpeg, image/png, max 8MB)
- **Response (201 Created):**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Hazard report submitted for verification.",
  "data": {
    "id": "HAZ-3921",
    "status": "Submitted", // "Submitted" | "Under Review" | "Verified" | "Resolved"
    "type": "Power Line Down",
    "description": "High voltage live line across intersection.",
    "location": { "lat": 37.7712, "lng": -122.4189, "address": "Market & 5th St" },
    "photoUrl": "https://cdn.rescuenet.org/uploads/hazards/haz-3921.jpg",
    "createdAt": "2026-10-05T00:35:00.000Z"
  }
}
```

### 7.2 List Hazard Reports
- **Endpoint:** `GET /api/v1/hazards`
- **Auth Required:** Yes
- **Query Parameters:** `status`, `lat`, `lng`, `radiusKm`

### 7.3 Verify or Clear Hazard
- **Endpoint:** `PATCH /api/v1/hazards/:id/verify`
- **Auth Required:** Yes (Admin or Rescue team)
- **Request Body:**
```json
{
  "status": "Verified", // "Verified" | "Cleared" | "Rejected"
  "verifiedBy": "Officer Vance (Badge #401)",
  "hazardSeverity": "Critical"
}
```

---

## 8. Road Closures & Impassable Routes (`/api/v1/road-closures`)

### 8.1 List Impassable Corridors
- **Endpoint:** `GET /api/v1/road-closures`
- **Auth Required:** No (Public routing data)
- **Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "rd-101",
      "roadName": "Embarcadero Causeway",
      "reason": "Coastal Tidal Surge Flooding",
      "status": "Closed", // "Closed" | "Restricted" | "Reopened"
      "startPoint": { "lat": 37.795, "lng": -122.393 },
      "endPoint": { "lat": 37.805, "lng": -122.401 },
      "alternateRoute": "Use inland arterial Mission St via detours.",
      "reportedAt": "2026-10-05T00:10:00.000Z"
    }
  ]
}
```

### 8.2 Report or Update Road Closure
- **Endpoint:** `POST /api/v1/road-closures`
- **Auth Required:** Yes (Admin or Traffic Dispatch)

---

## 9. Emergency Services Directory (`/api/v1/services`)

### 9.1 Query Medical, Police, & Fire Facilities
- **Endpoint:** `GET /api/v1/services`
- **Auth Required:** No
- **Query Parameters:**
  - `type`: `Hospital` | `Police` | `Fire` | `Relief`
  - `lat`: 37.7749
  - `lng`: -122.4194
  - `maxDistanceKm`: 15
- **Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "srv-01",
      "name": "St. Francis Trauma Center",
      "type": "Hospital",
      "phone": "+1 (555) 441-2000",
      "address": "900 Hyde St",
      "location": { "lat": 37.7892, "lng": -122.4168 },
      "distanceKm": 1.2,
      "traumaLevel": "Level 1",
      "icuBedsAvailable": 14,
      "erStatus": "Accepting Critical Patients"
    }
  ]
}
```

---

## 10. Citizen Emergency Contacts (`/api/v1/contacts`)

### 10.1 List User's Trusted Contacts
- **Endpoint:** `GET /api/v1/contacts`
- **Auth Required:** Yes (Citizen)

### 10.2 Add Trusted Contact
- **Endpoint:** `POST /api/v1/contacts`
- **Auth Required:** Yes (Citizen)
- **Request Body:**
```json
{
  "name": "Sarah Mercer",
  "relationship": "Spouse",
  "phone": "+15559281920",
  "email": "sarah.mercer@example.com",
  "notifyOnSOS": true
}
```

### 10.3 Dispatch Urgent SOS Notification to Contacts
- **Endpoint:** `POST /api/v1/contacts/notify`
- **Auth Required:** Yes (Internal microservice or triggered automatically by SOS creation)
- **Action:** Sends SMS/WhatsApp with live GPS tracker link to pre-configured contacts.

---

## 11. Command Center Telemetry & Analytics (`/api/v1/analytics`)

### 11.1 High-Level KPI Summary
- **Endpoint:** `GET /api/v1/analytics/overview`
- **Auth Required:** Yes (Admin only)
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "totalEmergenciesLogged": 142,
    "activeEmergencies": 11,
    "resolvedEmergencies": 131,
    "avgDispatchTimeMinutes": 3.8,
    "avgResolutionTimeMinutes": 42.5,
    "deployedRescueTeams": 7,
    "availableRescueTeams": 5,
    "shelterTotalCapacity": 2400,
    "shelterCurrentOccupancy": 1190,
    "overallShelterOccupancyPercent": 49.5
  }
}
```

### 11.2 Emergency Incident Density (GIS Heatmap)
- **Endpoint:** `GET /api/v1/analytics/heatmap`
- **Auth Required:** Yes (Admin only)
- **Response (200 OK):** Array of `[lat, lng, weight]` points for Leaflet.heat map layer.

---

## 12. Real-Time WebSockets Engine (`/ws/dispatch`)

### 12.1 Connection Handshake
- **URL:** `ws://localhost:5000/ws/dispatch?token=<JWT_TOKEN>`
- **Subprotocols:** `rescuenet-v1`
- **Authentication:** Token verified on handshake. Connection assigned to rooms based on user role (`room:citizens`, `room:dispatch_admin`, `room:rescue_units`, `room:incident_<id>`).

### 12.2 Inbound WebSocket Messages (Client -> Server)

#### 1. Real-Time Responders Location Ping
```json
{
  "event": "RESPONDER_LOCATION_PING",
  "data": {
    "teamId": "team-alpha-1",
    "lat": 37.7758,
    "lng": -122.4170,
    "heading": 92.4,
    "speed": 34.1
  }
}
```

#### 2. Ping / Keepalive
```json
{
  "event": "PING"
}
```

### 12.3 Outbound WebSocket Broadcasts (Server -> Client)

#### 1. Instant SOS Signal Broadcast
*Dispatched immediately to Command Center and all Field Responders.*
```json
{
  "event": "SOS_BROADCAST",
  "data": {
    "id": "SOS-94820",
    "type": "Flood",
    "severity": "Critical",
    "status": "New",
    "location": { "lat": 37.7749, "lng": -122.4194, "address": "Sector 4" },
    "citizenName": "Alex Mercer",
    "citizenPhone": "+15550192831",
    "createdAt": "2026-10-05T00:32:00.000Z"
  }
}
```

#### 2. Incident Status Transition
*Dispatched to Citizen and Assigned Rescue Team.*
```json
{
  "event": "STATUS_CHANGED",
  "data": {
    "incidentId": "SOS-94820",
    "previousStatus": "New",
    "newStatus": "Assigned",
    "assignedTeam": {
      "id": "team-alpha-1",
      "name": "Alpha Rapid Response",
      "leader": "Capt. Alex Mercer",
      "etaMinutes": 10
    },
    "updatedAt": "2026-10-05T00:34:00.000Z"
  }
}
```

#### 3. Urgent Civil Defense Broadcast Alert
*Dispatched to all connected clients.*
```json
{
  "event": "CIVIL_ALERT_BROADCAST",
  "data": {
    "id": "ALT-2026-081",
    "title": "Immediate Flash Flood Evacuation Notice",
    "severity": "Critical",
    "affectedArea": "Sector 4 & Lowland Basins"
  }
}
```

---

## 13. Recommended Database Schema (PostgreSQL + PostGIS)

If implementing with PostgreSQL and Prisma / TypeORM / Sequelize:

```sql
-- 1. Users Table
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(25) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('citizen', 'rescue', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Emergencies (SOS) Table
CREATE TABLE emergencies (
    id VARCHAR(36) PRIMARY KEY,
    citizen_id VARCHAR(36) REFERENCES users(id),
    type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'New',
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    address TEXT,
    accuracy DOUBLE PRECISION,
    people_count INT DEFAULT 1,
    medical_required BOOLEAN DEFAULT FALSE,
    assigned_team_id VARCHAR(36),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- 3. Rescue Teams Table
CREATE TABLE rescue_teams (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    leader_name VARCHAR(100) NOT NULL,
    phone VARCHAR(25) NOT NULL,
    specialization VARCHAR(100) NOT NULL,
    members_count INT DEFAULT 4,
    status VARCHAR(20) NOT NULL DEFAULT 'Available',
    current_latitude DOUBLE PRECISION,
    current_longitude DOUBLE PRECISION,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Alerts Table
CREATE TABLE alerts (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    affected_area TEXT NOT NULL,
    instructions TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE
);

-- 5. Shelters Table
CREATE TABLE shelters (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    address TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    capacity INT NOT NULL,
    current_occupancy INT DEFAULT 0,
    facilities TEXT[],
    contact_phone VARCHAR(25),
    status VARCHAR(20) DEFAULT 'Open'
);
```
