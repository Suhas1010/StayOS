# StayOS

A multi-property platform to manage PGs, hostels, and co-living properties, including rooms, tenants, rent, caretakers, and complaints.

## Overview

StayOS is a backend-first property management system designed for owners and caretakers managing PGs, hostels, and co-living spaces.

It provides a centralized system for operations that are commonly handled using notebooks, spreadsheets, or messaging applications.

The system supports multiple properties under a single owner and provides different access levels for:

- `OWNER`
- `CARETAKER`
- `TENANT`

The backend is being developed in phases, with **Phase 1 — Core Backend** currently complete.

---

## User Roles

### Owner

The owner has complete control over their properties and can:

- Create and manage properties
- Assign caretakers
- Create and manage rooms
- Register and manage tenants
- Generate rent records
- Mark rent as paid
- View complaints
- Update complaint status
- Delete complaints
- Access information across owned properties

### Caretaker

The caretaker manages day-to-day operations of assigned properties.

A caretaker can:

- Access assigned properties
- View rooms
- View tenants
- Manage rent where permitted
- View complaints
- Update complaint status

A caretaker cannot access properties they are not assigned to.

### Tenant

The tenant has access to their own tenant-related information.

A tenant can:

- View their tenant information
- View their assigned room
- View their rent records
- Raise complaints
- View their own complaints
- Track complaint status

---

## Core Features

### Authentication

- User registration and login
- JWT-based authentication
- Access and refresh token workflow
- Protected API routes
- Password hashing
- Role-based authorization
- Email verification
- Resend email verification
- Password change
- Forgot password
- Password reset
- Current-user endpoint
- Logout

### Property Management

- Create properties
- View properties
- View individual properties
- Update properties
- Delete properties
- Support multiple properties for one owner
- Assign caretakers
- Property-level access control

### Room Management

- Create rooms under a property
- Set room capacity
- Set room rent
- Track room occupants
- Assign tenants to rooms
- Remove tenants from rooms
- Prevent rooms from exceeding capacity

Room occupancy is based on the number of occupants compared with room capacity.

### Tenant Management

- Register tenants
- Assign tenants to properties
- Assign tenants to rooms
- Remove tenants from rooms
- Update tenant information
- Delete tenants
- Validate property and room relationships
- Check room capacity before assignment

### Rent Management

- Generate rent records for tenants
- Set rent amount
- Set due dates
- Track payment status
- Update rent records
- Delete rent records
- Mark rent as paid
- Tenant-specific rent access

Rent status:

```text
PENDING → PAID
PENDING → OVERDUE
```

### Complaint Management

Tenants can raise complaints related to their property.

Complaint status:

```text
REPORTED → IN_PROGRESS → RESOLVED
```

Owners and assigned caretakers can update complaint status.

Owners can delete complaints.

Tenants can view their own complaints.

---

## Authorization

StayOS does not rely only on user roles.

Access is also checked against the specific property and tenant relationship.

Example:

```text
Caretaker
    ↓
Assigned to Property A
    ↓
Can access Property A
    ↓
Cannot access Property B
```

Similarly:

```text
Owner
    ↓
Owns Property A
    ↓
Can manage Property A
    ↓
Cannot manage Property B
```

For tenant-specific resources:

```text
Tenant
    ↓
Tenant record
    ↓
Belongs to Property A
    ↓
Can access their own tenant-related data
```

This prevents users from accessing another property's data by simply changing an ID in an API request.

---

## Technology Stack

### Runtime

- Node.js

### Framework

- Express.js

### Database

- MongoDB
- Mongoose

### Authentication & Security

- JSON Web Tokens
- bcrypt
- CORS
- Cookie Parser

### Development

- Nodemon
- Git
- GitHub

---

## API Structure

The API uses versioned REST endpoints.

```text
/api/v1
```

### Authentication

```text
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/logout
GET    /api/v1/auth/current-user
PATCH  /api/v1/auth/change-password
GET    /api/v1/auth/verify-email/:verificationToken
POST   /api/v1/auth/resend-email-verification
POST   /api/v1/auth/forgot-password
POST   /api/v1/auth/reset-password/:resetToken
POST   /api/v1/auth/refresh-token
```

### Properties

```text
POST   /api/v1/properties
GET    /api/v1/properties
GET    /api/v1/properties/:propertyId
PATCH  /api/v1/properties/:propertyId
DELETE /api/v1/properties/:propertyId
```

### Rooms

```text
POST   /api/v1/properties/:propertyId/rooms
GET    /api/v1/properties/:propertyId/rooms
GET    /api/v1/properties/:propertyId/rooms/:roomId
PUT    /api/v1/properties/:propertyId/rooms/:roomId
DELETE /api/v1/properties/:propertyId/rooms/:roomId
```

### Tenants

```text
POST   /api/v1/properties/:propertyId/tenants
GET    /api/v1/properties/:propertyId/tenants
GET    /api/v1/properties/:propertyId/tenants/:tenantId
PATCH  /api/v1/properties/:propertyId/tenants/:tenantId
DELETE /api/v1/properties/:propertyId/tenants/:tenantId

POST   /api/v1/properties/:propertyId/tenants/:tenantId/assign-room/:roomId
PATCH  /api/v1/properties/:propertyId/tenants/:tenantId/remove-room
```

### Rent

```text
POST   /api/v1/properties/:propertyId/tenants/:tenantId/rent
GET    /api/v1/properties/:propertyId/tenants/:tenantId/rent
GET    /api/v1/properties/:propertyId/tenants/:tenantId/rent/:rentId
PATCH  /api/v1/properties/:propertyId/tenants/:tenantId/rent/:rentId
DELETE /api/v1/properties/:propertyId/tenants/:tenantId/rent/:rentId
POST   /api/v1/properties/:propertyId/tenants/:tenantId/rent/:rentId/pay
```

### Complaints

```text
POST   /api/v1/properties/:propertyId/complaints
GET    /api/v1/properties/:propertyId/complaints
GET    /api/v1/properties/:propertyId/complaints/my-complaints
GET    /api/v1/properties/:propertyId/complaints/:complaintId
PATCH  /api/v1/properties/:propertyId/complaints/:complaintId/status
DELETE /api/v1/properties/:propertyId/complaints/:complaintId
```

---

## Data Models

### User

```text
fullName
email
password
phone
role
```

Roles:

```text
OWNER
CARETAKER
TENANT
```

### Property

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

Property types:

```text
PG
HOSTEL
APARTMENT
```

### Room

```text
roomNumber
capacity
rentAmount
property
occupants[]
```

### Tenant

```text
user
property
room
```

### Rent

```text
tenant
property
amount
dueDate
status
```

Rent statuses:

```text
PENDING
PAID
OVERDUE
```

### Complaint

```text
tenant
property
title
description
status
createdAt
updatedAt
```

Complaint statuses:

```text
REPORTED
IN_PROGRESS
RESOLVED
```

---

## Project Structure

```text
StayOS/

└── server/

    ├── src/

    │   ├── controllers/
    │   │   ├── auth.controller.js
    │   │   ├── property.controller.js
    │   │   ├── room.controller.js
    │   │   ├── tenant.controller.js
    │   │   ├── rent.controller.js
    │   │   └── complaint.controller.js
    │   │
    │   ├── models/
    │   │   ├── user.model.js
    │   │   ├── property.model.js
    │   │   ├── room.model.js
    │   │   ├── tenant.model.js
    │   │   ├── rent.model.js
    │   │   └── complaint.model.js
    │   │
    │   ├── routes/
    │   │   ├── auth.routes.js
    │   │   ├── property.routes.js
    │   │   ├── room.routes.js
    │   │   ├── tenant.routes.js
    │   │   ├── rent.routes.js
    │   │   └── complaint.routes.js
    │   │
    │   ├── middlewares/
    │   │   ├── auth.middleware.js
    │   │   ├── role.middleware.js
    │   │   └── ownership.middleware.js
    │   │
    │   ├── services/
    │   │
    │   ├── utils/
    │   │   ├── ApiError.js
    │   │   ├── ApiResponse.js
    │   │   ├── AsyncHandler.js
    │   │   └── complaint.validators.js
    │   │
    │   ├── config/
    │   │   └── db.js
    │   │
    │   ├── app.js
    │   └── server.js
    │
    ├── .env
    ├── .gitignore
    ├── package.json
    ├── package-lock.json
    └── README.md
```

---

## Security

StayOS implements backend security measures including:

- JWT authentication
- Password hashing with bcrypt
- Role-based authorization
- Property ownership verification
- Caretaker assignment verification
- Tenant access verification
- Protected routes
- Input validation
- CORS configuration
- Environment variables for sensitive configuration

Sensitive environment variables are stored in `.env` and excluded from version control.

---

## Environment Variables

Create a `.env` file inside the `server` directory.

```env
PORT=5000

MONGO_URI=your_mongodb_connection_string

CORS_ORIGIN=http://localhost:5173

JWT_SECRET=your_jwt_secret
```

Do not commit `.env` to GitHub.

---

## Installation

Clone the repository and move into the server directory:

```bash
git clone <repository-url>

cd StayOS/server
```

Install dependencies:

```bash
npm install
```

Configure the `.env` file with your MongoDB connection string, JWT secret, and other required configuration.

---

## Running the Project

Start the development server:

```bash
npm run dev
```

For production:

```bash
npm start
```

---

## API Base URL

When running locally:

```text
http://localhost:5000/api/v1
```

---

# Development Phases

## Phase 1 — Core Backend

Phase 1 focuses on building the complete core REST backend.

### Completed

- Authentication
- JWT authorization
- Role-based access control
- Property management
- Caretaker assignment
- Room management
- Tenant management
- Room assignment
- Rent management
- Complaint management
- Property-level access control
- Tenant-level access control
- Centralized API errors/responses

### Current Phase 1 Status

```text
PHASE 1 — CORE BACKEND
        ↓
      COMPLETE
```

The next step is comprehensive API testing and a security/isolation audit before starting Phase 2.

---

# Phase 2 — Engineering Depth

Phase 2 focuses on turning the core backend into a more production-oriented system.

Planned features:

- Rent ledger
- Transaction management
- Payment history
- Pagination
- Search
- Filtering
- Database indexing
- Redis caching
- Rate limiting
- Advanced authentication
- Refresh-token rotation
- Token revocation
- Audit logging
- Stronger multi-property data isolation

Target architecture:

```text
Client
   ↓
Express API
   ↓
┌───────────────┐
│               │
Redis        MongoDB
│               │
└───────────────┘
```

---

# Phase 3 — Frontend & Deployment

After the backend is mature, StayOS will receive a frontend.

Planned stack:

- React
- Tailwind CSS
- Axios
- React Router

Planned dashboards:

- Owner Dashboard
- Caretaker Dashboard
- Tenant Dashboard

Planned deployment work:

- Production environment configuration
- Docker
- CI/CD
- HTTPS
- Logging
- Monitoring
- Database backups

---

## Development Roadmap

```text
PHASE 1
Core Backend
    ↓
Authentication
    ↓
Authorization
    ↓
Properties
    ↓
Rooms
    ↓
Tenants
    ↓
Rent
    ↓
Complaints
    ↓
Testing & Security Audit

PHASE 2
Engineering Depth
    ↓
Ledger & Transactions
    ↓
Pagination
    ↓
Search & Filtering
    ↓
Indexes
    ↓
Redis
    ↓
Advanced Security
    ↓
Audit Logging

PHASE 3
Frontend & Deployment
    ↓
React
    ↓
Dashboards
    ↓
Docker
    ↓
CI/CD
    ↓
Production Deployment
```

---

## Author

**Suhas**

StayOS is being developed as a backend-focused full-stack project with an emphasis on authentication, authorization, multi-property data isolation, API design, and production-oriented backend engineering.
