# Product Requirements Document (PRD)
## StayOS Backend — Multi-Property PG/Hostel Management API

**Version:** 1.0.0
**Product Type:** Backend REST API

---

## 1. Product Overview

StayOS is a multi-property management backend for PG, hostel, and co-living owners. It replaces the WhatsApp/Excel/notebook workflow with a centralized system for properties, rooms, tenants, rent, and complaints.

Version 1 is backend-only. Frontend is a separate, later phase.

---

## 2. Target Users

- **Owner** — administers properties, rooms, tenants, rent, caretaker assignment.
- **Caretaker** — manages one assigned property's rooms, tenants, complaints.
- **Tenant** — views own room/rent, raises/tracks complaints.

---

## 3. Core Features

### 3.1 Authentication & Authorization
- **Registration** with email verification (verification token sent, account unusable until confirmed — same pattern as Project Camp)
- **Login** issuing both an **access token** (short-lived, used on every request) and a **refresh token** (long-lived, stored as httpOnly cookie, used only to mint new access tokens)
- **Logout** — invalidates refresh token server-side
- **Current user** — return logged-in user's profile from token
- **Change password** — while logged in
- **Refresh token endpoint** — exchange a valid refresh token for a new access token without re-login
- **Forgot / reset password** — token-based reset flow via email
- **Resend email verification**
- Role-based access control (Owner / Caretaker / Tenant)
- Ownership checks in addition to role checks — a Caretaker must be verified as assigned to *that specific property*

### 3.2 Property Management
- CRUD (Owner only for write ops)
- Assign caretaker to a property
- One owner, multiple properties

### 3.3 Room Management
- Create rooms under a property (capacity, rent amount)
- Occupancy state derived from `occupants[]` vs `capacity`: AVAILABLE / PARTIALLY OCCUPIED / FULL
- Backend enforces `occupants.length <= capacity`

### 3.4 Tenant Management
- Register tenant, assign to property + room
- Validation chain: property belongs to owner → room belongs to property → room has capacity → tenant created → added to `occupants[]`

### 3.5 Rent Management
- Generate rent records (amount, due date, status)
- Status: PENDING → PAID, or PENDING → OVERDUE past due date
- Tenant restricted to own records

### 3.6 Complaint Management
- Tenant raises complaint against their property
- Status: REPORTED → IN_PROGRESS → RESOLVED
- Caretaker updates status, scoped to their assigned property only

---

## 4. Technical Specifications

### 4.1 API Endpoint Structure

**Auth Routes** `/api/v1/auth/`
```
POST   /register
POST   /login
POST   /logout                              (secured)
GET    /current-user                        (secured)
POST   /change-password                     (secured)
POST   /refresh-token
GET    /verify-email/:verificationToken
POST   /forgot-password
POST   /reset-password/:resetToken
POST   /resend-email-verification            (secured)
```

**Property Routes** `/api/v1/properties/`
```
POST   /                                    (secured, Owner)
GET    /                                    (secured)
GET    /:id                                 (secured, role-based)
PUT    /:id                                 (secured, Owner)
PUT    /:id/caretaker                       (secured, Owner)
DELETE /:id                                 (secured, Owner)
```

**Room Routes** `/api/v1/properties/:propertyId/rooms`
```
POST   /                                    (secured, Owner)
GET    /                                    (secured, role-based)
GET    /:roomId                             (secured, role-based)
PUT    /:roomId                             (secured, Owner)
DELETE /:roomId                             (secured, Owner)
```

**Tenant Routes** `/api/v1/tenants/`
```
POST   /                                    (secured, Owner)
GET    /property/:propertyId                (secured, role-based)
GET    /:id                                 (secured, role-based)
PUT    /:id                                 (secured, Owner)
DELETE /:id                                 (secured, Owner)
```

**Rent Routes** `/api/v1/rents/`
```
POST   /                                    (secured, Owner)
GET    /my-rents                            (secured, Tenant)
GET    /property/:propertyId                (secured, Owner/Caretaker)
PATCH  /:id/status                          (secured, Owner)
```

**Complaint Routes** `/api/v1/complaints/`
```
POST   /                                    (secured, Tenant)
GET    /property/:propertyId                (secured, Owner/Caretaker)
GET    /my-complaints                       (secured, Tenant)
PATCH  /:id/status                          (secured, Caretaker/Owner)
```

### 4.2 Permission Matrix

| Feature | Owner | Caretaker | Tenant |
|---|---|---|---|
| Create/Update/Delete Property | ✓ | ✗ | ✗ |
| Assign Caretaker | ✓ | ✗ | ✗ |
| Create/Update/Delete Room | ✓ | ✗ | ✗ |
| View Rooms | ✓ | ✓ own property | ✓ own room |
| Register/Update/Delete Tenant | ✓ | ✗ | ✗ |
| Generate Rent | ✓ | ✗ | ✗ |
| Mark Rent Paid | ✓ | ✗ | ✗ |
| View Rent | ✓ | ✓ own property | ✓ own only |
| Raise Complaint | ✗ | ✗ | ✓ |
| Update Complaint Status | ✓ | ✓ own property | ✗ |
| View Complaint | ✓ | ✓ own property | ✓ own only |

### 4.3 Data Models

**User**
```
fullName
email
password              (hashed, bcrypt)
phone
role                  [OWNER | CARETAKER | TENANT]
isEmailVerified        Boolean, default false
refreshToken           String (hashed or stored, invalidated on logout)
emailVerificationToken
emailVerificationExpiry
forgotPasswordToken
forgotPasswordExpiry
```

**Property**: `name, address, type[PG|HOSTEL|APARTMENT], owner, caretaker`

**Room**: `roomNumber, capacity, rentAmount, property, occupants[]`

**Rent**: `tenant, property, amount, dueDate, status[PENDING|PAID|OVERDUE]`

**Complaint**: `title, description, tenant, property, status[REPORTED|IN_PROGRESS|RESOLVED]`

---

## 5. Auth Flow Detail (mirrors Project Camp)

```
Register
   ↓
Verification email sent (token + expiry stored on User)
   ↓
User clicks verify-email link → isEmailVerified = true
   ↓
Login → issues:
   - accessToken  (short expiry, e.g. 15min–1hr, sent in response body)
   - refreshToken (long expiry, e.g. 7–10 days, httpOnly cookie + stored on User doc)
   ↓
Client sends accessToken on each request → verifyJWT middleware
   ↓
accessToken expires → client calls /refresh-token with refreshToken cookie
   ↓
Server validates refreshToken against stored value → issues new accessToken
   ↓
Logout → refreshToken cleared server-side + cookie cleared
```

**Forgot password:**
```
POST /forgot-password (email)
   ↓
resetToken + expiry generated, emailed
   ↓
POST /reset-password/:resetToken (new password)
   ↓
Token validated against expiry → password updated → token cleared
```

---

## 6. Security Features
- JWT access + refresh token pair
- Refresh token stored server-side (User doc) for invalidation on logout
- Role-based authorization middleware
- Ownership verification middleware — role check alone is insufficient
- Email verification required before full access (match Project Camp's pattern; can be relaxed to optional for V1 if email service setup is a blocker)
- Password reset via time-limited token
- Password hashing (bcrypt)
- Input validation on all endpoints
- CORS configuration

---

## 7. Version 1 Scope

**Must have:** Full auth flow (access/refresh tokens, email verification, password reset), RBAC + ownership checks, multi-property support, rooms, occupancy logic, tenants, rent records, complaints, REST API, MongoDB, deployment.

**Not required initially:** Frontend, online payments, WhatsApp integration, AI, Redis, BullMQ, maps, advanced analytics, microservices, Kubernetes.

---

## 8. Success Criteria
- Full auth flow working end to end: register → verify → login → access-protected-route → refresh → logout
- Forgot/reset password flow functioning
- Ownership-scoped data access enforced at the backend, not just hidden in UI
- Full property → room → tenant → rent → complaint lifecycle working
- Deployed API, testable via Postman/Thunder Client

---

# File Structure — Backend Only

```
server/
├── src/
│   ├── controllers/
│   │   ├── auth.controllers.js
│   │   ├── property.controllers.js
│   │   ├── room.controllers.js
│   │   ├── tenant.controllers.js
│   │   ├── rent.controllers.js
│   │   └── complaint.controllers.js
│   │
│   ├── models/
│   │   ├── user.models.js
│   │   ├── property.models.js
│   │   ├── room.models.js
│   │   ├── rent.models.js
│   │   └── complaint.models.js
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
│   │   ├── auth.middlewares.js          # verifyJWT (access token)
│   │   ├── role.middlewares.js          # verifyRole(["OWNER"]) etc.
│   │   └── ownership.middlewares.js     # verifyPropertyOwnership, verifyCaretakerAssignment
│   │
│   ├── services/
│   │   ├── rentStatus.services.js       # PENDING -> OVERDUE logic (cron-triggered)
│   │   └── email.services.js            # verification + reset password emails
│   │
│   ├── utils/
│   │   ├── ApiError.js
│   │   ├── ApiResponse.js
│   │   ├── AsyncHandler.js
│   │   ├── generateTokens.js            # accessToken + refreshToken helpers
│   │   └── constants.js                 # role enums, status enums
│   │
│   ├── config/
│   │   └── db.js
│   │
│   ├── app.js
│   └── server.js
│
├── .env
├── .env.sample
├── .gitignore
├── package.json
└── README.md
```

---

## Build Order

1. **Auth** — register, email verification, login (access + refresh tokens), current-user, logout, change-password, refresh-token endpoint, forgot/reset password
2. **Property** — CRUD + Owner-only checks
3. **Room** — CRUD + capacity enforcement
4. **Tenant** — registration + room assignment logic
5. **Rent** — record generation + status lifecycle
6. **Complaint** — raise/track/resolve