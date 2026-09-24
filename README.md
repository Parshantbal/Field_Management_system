# Project KEYSTONE – Commercial Field Service Management Platform

Project KEYSTONE is an enterprise-grade field service management (FSM) platform tailored for commercial facilities operations. Built with **Spring Boot 3 (Java 24)**, **React 18**, **TypeScript**, and **PostgreSQL / H2 PG-Mode**, KEYSTONE brings dispatchers, facility managers, field technicians, and clients onto a unified operational plane.

---

## Key Highlights

- **Work Order Lifecycle State Machine**: Full lifecycle tracking:
  $$\text{OPEN} \longrightarrow \text{TRIAGED} \longrightarrow \text{ASSIGNED} \longrightarrow \text{EN\_ROUTE} \longrightarrow \text{ON\_SITE} \longrightarrow \text{COMPLETED} \longrightarrow \text{CLOSED}$$
- **Algorithmic Smart Dispatch**: Scores available technicians based on verified trade skills (HVAC, Electrical, Plumbing, Fire Safety), active job load, and availability.
- **Real-Time SLA Engine**: Dynamic computation of response and resolution deadlines according to priority matrices ($P1$ Critical = 1h response/4h resolution, $P2$ High = 4h/24h, $P3$ Medium = 8h/48h, $P4$ Low = 24h/120h) with real-time countdown countdowns and breach risk alerts (`SAFE`, `WARNING`, `BREACHED`).
- **Inventory & Labor Tracking**: Direct deduction of parts consumed on work orders with unit pricing, technician labor timers (clock-in / clock-out with automatic labor cost calculation), and job total accumulation.
- **Tenant Self-Service Portal**: Customers submit maintenance requests, track technician ETA in real time, and submit 5-star ratings and reviews upon job completion.
- **Centralized Role-Based System (RBAC)**: Secure JWT authentication protecting roles (`ROLE_ADMIN`, `ROLE_DISPATCHER`, `ROLE_TECHNICIAN`, `ROLE_CUSTOMER`).
- **In-App Persona Switcher**: Instant switching between all 4 demo personas from the top navigation bar without manual logout or credential re-entry.

---

## Pre-Loaded Demo Personas

All accounts use the password: `password123`

| Role | Name | Email | Focus |
| :--- | :--- | :--- | :--- |
| **Admin** | Elena Rostova | `admin@keystone.io` | Full platform oversight, SLA metrics, total spend |
| **Dispatcher** | Marcus Vance | `dispatcher@keystone.io` | Backlog triage, smart dispatch, technician scheduling |
| **Technician 1** | Julian Davis | `tech.davis@keystone.io` | HVAC field specialist, clock-in, parts logger |
| **Technician 2** | Sarah Chen | `tech.chen@keystone.io` | Master electrician, emergency generator ATS service |
| **Customer** | David Miller | `client.apex@keystone.io` | Apex Tower Facility Manager self-service portal |

---

## Pre-Loaded Facilities & Assets

1. **Apex Tower Commercial Complex** (`FAC-APEX-01` - 480,000 sq ft, 42 floors)
   - Centrifugal Chiller Unit #2 (`HVAC-CH-002`)
   - Main Switchgear Panel 480V (`ELEC-SWG-001`)
2. **Metro Logistics & Distribution Center** (`FAC-METRO-02` - 350,000 sq ft)
   - Emergency Generator 750kVA (`ELEC-GEN-003`)
3. **Horizon Life Sciences Pavilion** (`FAC-HORIZON-03` - 110,000 sq ft)
   - Cleanroom Precision Air Handler 4 (`HVAC-AHU-004`)

---

## Quick Start Guide

### Prerequisites
- Java 17+ (Java 21 or Java 24 supported)
- Maven 3.8+
- Node.js 18+ and npm

### 1. Launching with PowerShell Scripts
To launch both services simultaneously in separate windows:
```powershell
.\scripts\start-all.ps1
```

Or start individually:
```powershell
# In terminal 1 (Backend):
.\scripts\start-backend.ps1

# In terminal 2 (Frontend):
.\scripts\start-frontend.ps1
```

### 2. Manual Startup

#### Backend
```bash
cd backend
mvn spring-boot:run
```
- API Base: `http://localhost:8080/api`
- Default DB: Embedded H2 in PostgreSQL compatibility mode (`jdbc:h2:mem:keystonedb`)
- H2 Console: `http://localhost:8080/h2-console`
- Production PostgreSQL profile:
  ```bash
  mvn spring-boot:run -Dspring-boot.run.profiles=postgres
  ```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```
- Web Application: `http://localhost:5173`

---

## Architecture

```
keystone/
├── backend/
│   ├── src/main/java/com/keystone/
│   │   ├── config/ (SecurityConfig, WebMvc)
│   │   ├── controller/ (Auth, WorkOrder, Dispatch, Inventory, Tech, Portal, Dashboard)
│   │   ├── data/ (DataInitializer demo seeder)
│   │   ├── dto/ (AuthDTO, WorkOrderDTO, DispatchDTO, InventoryDTO, DashboardDTO)
│   │   ├── model/ (User, Facility, Asset, Technician, WorkOrder, Part, TimeEntry, AuditLog)
│   │   ├── repository/ (Spring Data JPA Repositories)
│   │   ├── security/ (JwtTokenProvider, JwtAuthenticationFilter, UserPrincipal)
│   │   └── service/ (WorkOrderService, DispatchService, SlaService, InventoryService, TimeTrackingService)
│   └── src/main/resources/
│       ├── application.yml (H2 PostgreSQL-mode default)
│       ├── application-postgres.yml (Production PostgreSQL config)
│       └── schema-postgres.sql (Pure PostgreSQL DDL)
└── frontend/
    └── src/
        ├── api/client.ts (Type-safe API client with JWT interceptor)
        ├── context/AuthContext.tsx (Persona state & quick switcher)
        ├── components/
        │   ├── common/ (Navbar, Sidebar, Badges, SLA Countdown)
        │   ├── dashboard/ (ExecutiveDashboard with KPIs & live audit stream)
        │   ├── workorders/ (WorkOrderListView, WorkOrderDetailModal, CreateWorkOrderModal)
        │   ├── dispatch/ (DispatchBoard with Smart Match scoring)
        │   ├── technician/ (TechnicianFieldView with job timer & parts logger)
        │   ├── inventory/ (InventoryCatalog with stock adjustment)
        │   └── portal/ (CustomerPortalView with ticket tracker & rating wizard)
        └── types/index.ts
```
