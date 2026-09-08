# StayOS — Multi-Property PG / Hostel / Co-Living Management Platform

**Version:** 2.0  
**Product Type:** Full-Stack Web Application  
**Owner:** Suhas  
**Status:** Phase 1 — Core Backend Complete

---

## 1. Product Overview

StayOS is a multi-property PG, hostel, and co-living management platform.

The system allows a single owner to manage multiple properties while maintaining property-scoped access control.

Each property can contain:

- Rooms
- Tenants
- Caretakers
- Rent records
- Complaints

The backend follows a production-oriented architecture with:

- JWT authentication
- Role-based access control
- Property-level authorization
- Modular routes/controllers
- Centralized error handling
- Validation
- MongoDB/Mongoose
- Property-level data isolation

---

## 2. User Roles

### OWNER

Has complete control over owned properties.

Can:

- Create, update, and delete properties
- Manage rooms
- Manage tenants
- Manage rent
- Manage complaints
- Assign caretakers
- Access data belonging to owned properties

### CARETAKER

Can access and manage only properties assigned to them.

Can:

- View/manage rooms where permitted
- View tenants
- Manage rent
- Update complaint status
- Access only assigned properties

### TENANT

Can access only their own tenant-related information.

Can:

- View own profile
- View own rent records
- Create complaints
- View own complaints
- View permitted property/room information

---

## 3. Core Data Model

```text
User
 ├── OWNER
 ├── CARETAKER
 └── TENANT

OWNER
  │
  └── 1:N Properties
          │
          ├── 1:N Rooms
          │      └── Occupants
          │
          ├── 1:N Tenants
          │
          ├── 1:N Rent Records
          │
          └── 1:N Complaints

Property
 └── Caretaker
```

### Main Models

- User
- Property
- Room
- Tenant
- Rent
- Complaint

---

# PHASE 1 — CORE BACKEND

## 4. Authentication

Base path:

```text
/api/v1/auth
```

### Routes

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/register` | Register user |
| POST | `/login` | Login |
| POST | `/logout` | Logout |
| GET | `/current-user` | Get logged-in user |
| PATCH | `/change-password` | Change password |
| GET | `/verify-email/:verificationToken` | Verify email |
| POST | `/resend-email-verification` | Resend verification |
| POST | `/forgot-password` | Request password reset |
| POST | `/reset-password/:resetToken` | Reset password |
| POST | `/refresh-token` | Refresh access token |

### Authentication Standards

- JWT-based authentication
- Access token + refresh token
- Password hashing
- Email verification
- Password reset
- Protected routes through `verifyJWT`
- Role-based authorization through `verifyRole`

---

## 5. Property Management

Base path:

```text
/api/v1/properties
```

### Routes

| Method | Endpoint | Access |
|---|---|---|
| POST | `/` | OWNER |
| GET | `/` | OWNER |
| GET | `/:propertyId` | OWNER |
| PATCH | `/:propertyId` | OWNER |
| DELETE | `/:propertyId` | OWNER |

### Property Fields

```text
name
description
type
owner
caretaker
address
contact
amenities
images
```

### Property Types

```text
PG
HOSTEL
APARTMENT
```

### Access Rules

An owner can access only properties where:

```text
property.owner === req.user._id
```

A caretaker can access only properties assigned to them.

---

## 6. Room Management

Base path:

```text
/api/v1/properties/:propertyId/rooms
```

### Room Fields

```text
roomNumber
capacity
rentAmount
property
occupants[]
```

### Routes

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/` | Create room |
| GET | `/` | Get rooms |
| GET | `/:roomId` | Get room |
| PUT | `/:roomId` | Update room |
| DELETE | `/:roomId` | Delete room |

### Room Rules

- Every room belongs to one property.
- Occupants are tracked through the `occupants` array.
- Room capacity must be respected.
- A tenant and room must belong to the same property.
- Room deletion should not leave active occupants.

---

## 7. Tenant Management

Base path:

```text
/api/v1/properties/:propertyId/tenants
```

### Tenant Fields

```text
user
property
room
```

### Routes

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/` | Create tenant |
| GET | `/` | Get tenants |
| GET | `/:tenantId` | Get tenant |
| PATCH | `/:tenantId` | Update tenant |
| DELETE | `/:tenantId` | Delete tenant |
| POST | `/:tenantId/assign-room/:roomId` | Assign room |
| PATCH | `/:tenantId/remove-room` | Remove from room |

### Tenant Rules

- Tenant must have the `TENANT` role.
- Tenant belongs to one property.
- Tenant may occupy one room.
- Room and tenant must belong to the same property.
- Room capacity cannot be exceeded.
- Removing a tenant also removes them from the room's `occupants` array.

---

## 8. Rent Management

Base path:

```text
/api/v1/properties/:propertyId/tenants/:tenantId/rent
```

### Rent Fields

```text
tenant
property
amount
dueDate
status
```

### Rent Status

```text
PENDING
PAID
OVERDUE
```

### Routes

| Method | Endpoint | Access |
|---|---|---|
| POST | `/` | OWNER / CARETAKER |
| GET | `/` | OWNER / CARETAKER / TENANT |
| GET | `/:rentId` | OWNER / CARETAKER / TENANT |
| PATCH | `/:rentId` | OWNER / CARETAKER |
| DELETE | `/:rentId` | OWNER |
| POST | `/:rentId/pay` | OWNER / CARETAKER |

### Rent Rules

Every rent operation must verify:

```text
Tenant → Property
Rent → Tenant
Rent → Property
```

This prevents cross-property data access.

---

## 9. Complaint Management

Base path:

```text
/api/v1/properties/:propertyId/complaints
```

### Complaint Fields

```text
tenant
property
title
description
status
createdAt
updatedAt
```

### Complaint Status

```text
REPORTED
IN_PROGRESS
RESOLVED
```

### Routes

| Method | Endpoint | Access |
|---|---|---|
| POST | `/` | TENANT |
| GET | `/` | OWNER / CARETAKER |
| GET | `/my-complaints` | TENANT |
| GET | `/:complaintId` | OWNER / CARETAKER / TENANT |
| PATCH | `/:complaintId/status` | OWNER / CARETAKER |
| DELETE | `/:complaintId` | OWNER |

### Complaint Rules

- Tenant can create complaints only for their property.
- Tenant can view their own complaints.
- Owner/caretaker can view complaints for accessible properties.
- Only owner/caretaker can update complaint status.
- Complaint must belong to the requested property.
- Only the owner can delete complaints.

---

## 10. Backend Engineering Standards

### Architecture

```text
routes
   ↓
middlewares
   ↓
controllers
   ↓
models
```

Business logic can gradually move into:

```text
services/
```

### Utilities

Centralized utilities:

- `AsyncHandler`
- `ApiError`
- `ApiResponse`

### Security

- JWT authentication
- Role-based authorization
- Property-access middleware
- Password hashing
- Input validation
- Property-level data isolation

### Property Access Middleware

Core middleware:

```text
verifyPropertyOwnership
verifyCaretakerAssignment
verifyPropertyAccess
verifyTenantAccess
```

The objective is to ensure that a user cannot access another property's data simply by changing a MongoDB ObjectId in the URL.

---

# PHASE 2 — ENGINEERING DEPTH

## 11. Rent Ledger

Move from isolated rent records toward a proper financial ledger.

Potential structure:

```text
Tenant
   ↓
Monthly Rent
   ↓
Payment
   ↓
Transaction
```

Track:

- Rent generated
- Amount paid
- Remaining balance
- Payment date
- Payment method
- Transaction reference
- Payment history

---

## 12. Database Optimization

Introduce indexes for frequently queried fields.

Potential indexes:

```text
User.email
Property.owner
Property.caretaker
Room.property
Tenant.property
Tenant.user
Rent.tenant
Rent.property
Complaint.property
Complaint.tenant
```

Add compound indexes where query patterns justify them.

---

## 13. Search, Filtering & Pagination

### Search & Filtering

Support:

```text
Search tenants
Search rooms
Filter occupied/vacant rooms
Filter rent by status
Filter complaints by status
Filter complaints by tenant
```

Example:

```text
GET /tenants?search=suhas
GET /rent?status=PAID
GET /complaints?status=REPORTED
```

### Pagination

Large datasets should not be returned in a single request.

Implement pagination for:

- Properties
- Rooms
- Tenants
- Rent records
- Complaints
- Transactions

Example:

```text
GET /tenants?page=1&limit=10
```

Response should contain metadata such as:

```text
total
page
limit
totalPages
```

---

## 14. Redis

Introduce Redis for performance-critical operations.

Potential uses:

- Caching property data
- Rate limiting
- Frequently accessed dashboard data
- Temporary verification/reset data
- Token/session-related workflows

Architecture:

```text
Client
   ↓
Express API
   ↓
Redis ───── MongoDB
```

---

## 15. Advanced Authentication & Security

Improve authentication with:

- Refresh-token rotation
- Token revocation
- Rate limiting
- Login attempt protection
- Strong validation
- Secure cookie configuration
- Security headers
- Better error handling
- Audit logging

---

## 16. Multi-Tenancy / Data Isolation

Strengthen property-level isolation.

Every property-owned resource should ultimately be traceable through:

```text
User
 ↓
Property
 ↓
Resource
```

No owner/caretaker should be able to access another property's:

- Rooms
- Tenants
- Rent
- Complaints
- Transactions

---

# PHASE 3 — FRONTEND & DEPLOYMENT

## 17. Frontend

### Frontend Stack

```text
React
Tailwind CSS
Axios
React Router
```

### Main UI

```text
Login / Register
      ↓
Dashboard
      ↓
Properties
      ├── Rooms
      ├── Tenants
      ├── Rent
      ├── Complaints
      └── Transactions
```

### Owner Dashboard

Display:

- Total properties
- Total rooms
- Occupied rooms
- Vacant rooms
- Total tenants
- Pending rent
- Overdue rent
- Open complaints

### Caretaker Dashboard

Display information only for assigned properties.

### Tenant Dashboard

Display:

- Room information
- Rent
- Payment history
- Complaints
- Complaint status

---

## 18. Deployment

Production architecture:

```text
Frontend
   ↓
Backend API
   ↓
MongoDB
   ↓
Redis
```

Production concerns:

- Environment variables
- CORS configuration
- HTTPS
- Logging
- Error monitoring
- Database backups
- API rate limiting
- CI/CD
- Docker
- Production configuration

---

# 19. Complete Development Order

## Phase 1 — Core Backend

1. Project setup
2. Authentication
3. Authorization & middleware
4. Property management
5. Room management
6. Tenant management
7. Rent management
8. Complaint management
9. API testing & security audit

## Phase 2 — Engineering Depth

10. Rent ledger
11. Transactions
12. Pagination
13. Search & filtering
14. Database indexing
15. Redis
16. Advanced authentication
17. Rate limiting
18. Audit logging
19. Strong multi-property isolation

## Phase 3 — Product

20. React frontend
21. Dashboards
22. Tenant UI
23. Owner UI
24. Caretaker UI
25. Deployment
26. Docker / CI-CD
27. Production monitoring

---

# 20. Resume Positioning

## StayOS — Multi-Property PG / Hostel Management Platform

A full-stack property management platform supporting:

- Multi-property ownership
- Role-based access control
- Tenant management
- Room allocation
- Rent tracking
- Complaint management
- Financial ledger
- Redis caching
- Database optimization
- Property-level data isolation

### Backend Highlights

- JWT authentication
- RBAC
- Multi-property authorization
- MongoDB + Mongoose
- REST APIs
- Centralized error handling
- Validation
- Pagination
- Search/filtering
- Database indexing
- Redis caching
- Financial ledger
- Rate limiting
- Audit logging

### Final Architecture Goal

```text
                    ┌──────────────┐
                    │    React     │
                    │   Frontend   │
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │  Express API │
                    └──────┬───────┘
                           │
             ┌─────────────┼─────────────┐
             ▼             ▼             ▼
        ┌─────────┐   ┌─────────┐   ┌──────────┐
        │  Redis  │   │ MongoDB │   │ Services │
        └─────────┘   └─────────┘   └──────────┘
```

---

# Current Milestone

**Phase 1 — Core Backend: COMPLETE**

Before starting Phase 2:

- Test all Phase 1 routes
- Verify role-based access
- Verify property isolation
- Test invalid IDs
- Test unauthorized access
- Test edge cases
- Perform a backend security audit

Then begin **Phase 2 — Engineering Depth**.
