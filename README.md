# StayOS

A simple platform to manage PGs, hostels, and co-living properties, including rooms, tenants, rent, caretakers, and complaints.

## Overview

StayOS is a multi-property management system designed for owners and caretakers of PGs, hostels, and co-living spaces.

It provides a centralized system to manage property operations that are commonly handled using notebooks, spreadsheets, or messaging applications.

The system supports multiple properties under a single owner and provides different levels of access for owners, caretakers, and tenants.

## User Roles

StayOS has three types of users:

### Owner

The owner has complete control over their properties and can:

* Create and manage properties
* Assign caretakers
* Create and manage rooms
* Register and manage tenants
* Generate rent records
* Mark rent as paid
* View complaints
* Update complaint status
* Access information across all owned properties

### Caretaker

The caretaker manages the day-to-day operations of an assigned property.

A caretaker can:

* View rooms in their assigned property
* View tenants in their assigned property
* View rent records for their assigned property
* View complaints
* Update complaint status

A caretaker cannot access or manage properties they are not assigned to.

### Tenant

The tenant has access only to their own information.

A tenant can:

* View their assigned room
* View their rent records
* Raise complaints
* View their complaints
* Track complaint status

## Core Features

### Authentication

* User registration and login
* JWT-based authentication
* Protected API routes
* Password hashing using bcrypt
* Role-based authorization

### Property Management

* Create properties
* View properties
* Update properties
* Delete properties
* Support multiple properties for one owner
* Assign caretakers to properties

### Room Management

* Create rooms under a property
* Set room capacity
* Set room rent
* Track room occupants
* Automatically determine occupancy status
* Prevent rooms from exceeding their capacity

Room occupancy can be:

* `AVAILABLE`
* `PARTIALLY OCCUPIED`
* `FULL`

### Tenant Management

* Register tenants
* Assign tenants to properties
* Assign tenants to rooms
* Validate property and room ownership
* Check room capacity before assignment
* Track tenants through room occupancy

### Rent Management

* Generate rent records for tenants
* Set rent amount
* Set due dates
* Track payment status

Rent status:

```text
PENDING → PAID
PENDING → OVERDUE
```

Tenants can only view their own rent records.

### Complaint Management

Tenants can raise complaints related to their property.

Complaint status:

```text
REPORTED → IN_PROGRESS → RESOLVED
```

Owners and assigned caretakers can update complaint status.

## Authorization

StayOS does not rely only on user roles.

Access is also checked against the specific property.

For example:

```text
Caretaker
    ↓
Assigned to Property A
    ↓
Can access Property A
    ↓
Cannot access Property B
```

Similarly, owners can only manage properties that belong to them.

This ensures that users cannot access another user's property data by simply changing an ID in an API request.

## Technology Stack

### Runtime

* Node.js

### Framework

* Express.js

### Database

* MongoDB
* Mongoose

### Authentication & Security

* JSON Web Tokens
* bcrypt
* CORS
* Cookie Parser

### Development

* Nodemon
* Git
* GitHub

## API Structure

The API uses versioned REST endpoints.

```text
/api/v1
```

### Authentication

```text
POST   /api/v1/auth/register
POST   /api/v1/auth/login
GET    /api/v1/auth/me
```

### Properties

```text
POST   /api/v1/properties
GET    /api/v1/properties
GET    /api/v1/properties/:id
PUT    /api/v1/properties/:id
PUT    /api/v1/properties/:id/caretaker
DELETE /api/v1/properties/:id
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
POST   /api/v1/tenants
GET    /api/v1/tenants/property/:propertyId
GET    /api/v1/tenants/:id
PUT    /api/v1/tenants/:id
DELETE /api/v1/tenants/:id
```

### Rent

```text
POST   /api/v1/rents
GET    /api/v1/rents/my-rents
GET    /api/v1/rents/property/:propertyId
PATCH  /api/v1/rents/:id/status
```

### Complaints

```text
POST   /api/v1/complaints
GET    /api/v1/complaints/property/:propertyId
GET    /api/v1/complaints/my-complaints
PATCH  /api/v1/complaints/:id/status
```

### Health Check

```text
GET    /api/v1/healthcheck
```

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
address
type
owner
caretaker
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
title
description
tenant
property
status
```

Complaint statuses:

```text
REPORTED
IN_PROGRESS
RESOLVED
```

## Project Structure

```text
StayOs/
└── server/
    ├── src/
    │   ├── controllers/
    │   │   ├── auth.controllers.js
    │   │   ├── property.controllers.js
    │   │   ├── room.controllers.js
    │   │   ├── tenant.controllers.js
    │   │   ├── rent.controllers.js
    │   │   ├── complaint.controllers.js
    │   │   └── healthcheck.controllers.js
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
    │   │   ├── complaint.routes.js
    │   │   └── healthcheck.routes.js
    │   │
    │   ├── middlewares/
    │   │   ├── auth.middlewares.js
    │   │   ├── role.middlewares.js
    │   │   ├── ownership.middlewares.js
    │   │   └── multer.middlewares.js
    │   │
    │   ├── services/
    │   │   ├── rentStatus.services.js
    │   │   └── occupancy.services.js
    │   │
    │   ├── utils/
    │   │   ├── ApiError.js
    │   │   ├── ApiResponse.js
    │   │   ├── AsyncHandler.js
    │   │   └── constants.js
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

## Security

StayOS implements several backend security measures:

* JWT authentication
* Password hashing with bcrypt
* Role-based authorization
* Property ownership verification
* Caretaker assignment verification
* Protected routes
* Input validation
* CORS configuration
* Environment variables for sensitive configuration

Sensitive environment variables are stored in `.env` and excluded from version control.

## Environment Variables

Create a `.env` file inside the `server` directory.

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
CORS_ORIGIN=http://localhost:5173
JWT_SECRET=your_jwt_secret
```

Do not commit `.env` to GitHub.

## Installation

Clone the repository and move into the server directory:

```bash
git clone <repository-url>
cd StayOs/server
```

Install dependencies:

```bash
npm install
```

Configure the `.env` file with your MongoDB connection string and JWT secret.

## Running the Project

Start the development server:

```bash
npm run dev
```

For production:

```bash
npm start
```

## API Base URL

When running locally:

```text
http://localhost:5000/api/v1
```

## Development Status

StayOS is currently under active development.

The backend is being developed feature by feature, starting with the core authentication and property-management system.

## Author

**Suhas**
