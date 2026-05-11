# NBR Licensing Portal — Backend

Bank Licensing & Compliance Portal API built with NestJS.

## Prerequisites

- Node.js 20+
- pnpm
- Docker (for the database)

## Project setup

### 1. Clone and install dependencies

```bash
pnpm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` with your values. The defaults work with the Docker Compose setup:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=nbr_licensing
PORT=4000
JWT_ACCESS_TOKEN_SECRET=change-me-to-a-strong-random-secret
```

### 3. Start the database

```bash
pnpm docker-db:start
```

### 4. Run migrations

```bash
pnpm migration:run
```

### 5. Seed the database

```bash
pnpm seed
```

### 6. Start the API

```bash
pnpm start:dev
```

The API is available at `http://localhost:4000/api/v1`.

---

## Interactive API Documentation (Swagger UI)

The API ships with a fully interactive Swagger UI powered by `@nestjs/swagger`.

**URL:** `http://localhost:4000/docs`

## Seeded Accounts

All accounts are created by `pnpm seed`. Passwords are hashed with bcrypt.

| Role      | Email             | Password       |
| --------- | ----------------- | -------------- |
| ADMIN     | admin@nbr.rw      | Admin@1234     |
| APPLICANT | applicant1@nbr.rw | Applicant@1234 |
| APPLICANT | applicant2@nbr.rw | Applicant@1234 |
| REVIEWER  | reviewer1@nbr.rw  | Reviewer@1234  |
| REVIEWER  | reviewer2@nbr.rw  | Reviewer@1234  |
| APPROVER  | approver@nbr.rw   | Approver@1234  |

---

## Seeded Applications

The seed creates 7 applications covering every lifecycle stage:

| Institution                 | Status           | Applicant  | Reviewer  | Approver |
| --------------------------- | ---------------- | ---------- | --------- | -------- |
| Kigali Commercial Bank Ltd  | DRAFT            | applicant1 | —         | —        |
| Rwanda Microfinance Corp    | SUBMITTED        | applicant1 | —         | —        |
| East Africa Savings Bank    | UNDER_REVIEW     | applicant2 | reviewer1 | —        |
| Horizon Digital Finance     | INFO_REQUESTED   | applicant2 | reviewer1 | —        |
| Great Lakes Investment Bank | REVIEW_COMPLETED | applicant1 | reviewer2 | —        |
| Umurenge Cooperative Bank   | APPROVED         | applicant2 | reviewer2 | approver |
| Frontier Forex Bureau       | REJECTED         | applicant1 | reviewer1 | approver |

Each application has a full audit trail reflecting its lifecycle transitions.

---

## Design overview

### Architecture

The backend is organized into separate parts, each with a clear job. There are modules for authentication, users, applications, documents, audit logging, database setup, and shared helpers. Each module is responsible for its own area, which makes the system easier to understand, test, and maintain. Communication between the client and server is done using standard web requests (REST API), and all data is stored in a PostgreSQL database. Authentication uses secure tokens, and files are stored on the server with their details saved in the database. Every important action is logged for accountability.

### Data Model (How Data is Structured)

There are four main types of data:

- **Users**: People who use the system. Each user has an email, password (securely stored), and a role (like applicant, reviewer, approver, or admin). Users are linked to applications, documents, and audit logs.
- **Applications**: These are the license requests. Each application has details like its status (such as draft, submitted, under review, etc.), the institution name, license type, and notes. Applications are connected to users and can have documents attached.
- **Documents**: Files uploaded as part of an application. Each document is linked to an application and a user, and stores information like the file name, type, and size.
- **Audit Logs**: Records of important actions, like submitting an application or uploading a document. Each log entry notes what happened, who did it, and when.

### State Machine (How Applications Move Through the Process)

Applications go through a series of steps, starting as a draft and moving through submission, review, possible requests for more information, and finally approval or rejection. Only certain users can move an application from one step to another, and every change is checked and recorded. The allowed steps are:

- Draft
- Submitted
- Under Review
- Info Requested
- Resubmitted
- Review Completed
- Approved
- Rejected

Each move from one step to another follows strict rules. For example, only the applicant can submit a draft, only a reviewer can start a review, and only an approver can make the final decision. The system checks that each move is allowed before making it.

### Roles (Who Can Do What)

There are four main roles:

- **Applicant**: Can create and submit their own applications, respond to information requests, and see only their own applications.
- **Reviewer**: Can see all applications, start reviews, ask for more information, and complete reviews, but cannot approve or reject applications.
- **Approver**: Can see all applications and make the final decision to approve or reject, but cannot review or request information.
- **Admin**: Has full access to everything, including managing users and viewing all audit logs.

These roles are designed to keep responsibilities clear and to make sure no one has more access than they need.

### Hard Decisions and Trade-offs

- **State Machine**: The process is strict to prevent mistakes, but this can make it less flexible. If more time was available, the process could be made more customizable for different types of licenses.
- **Roles**: The four roles are simple and clear, but might be too basic for larger organizations. A more detailed permission system could be added in the future.
- **Audit Logging**: All actions are logged right away for accuracy, but this can slow things down a bit. In the future, logging could be done in the background for better performance.
- **Data Relationships**: The data is organized to avoid duplication, which keeps it accurate but can make some searches slower. Some fields could be duplicated for speed if needed.
- **File Storage**: Files are stored on the server for simplicity, but this doesn't scale well. Using cloud storage would be better for a larger system.
- **Transactions**: All important changes happen together to avoid errors, but this can make the system more complex. An event-driven approach could be used for even more reliability.

Overall, the design focuses on being clear, secure, and easy to maintain, while leaving room for future improvements if the system needs to grow or handle more complex requirements.

#### Role Definitions

1. **APPLICANT**
   - **Can**: Create applications, submit drafts, resubmit after info requests, view own applications
   - **Cannot**: View others' applications, start reviews, request info, approve/reject, access audit trails
   - **Purpose**: External users applying for licenses

2. **REVIEWER**
   - **Can**: View all applications, start reviews, request additional info, complete reviews, view audit trails
   - **Cannot**: Create applications, approve/reject applications, access admin functions
   - **Purpose**: Internal staff who review applications for completeness and accuracy

3. **APPROVER**
   - **Can**: View all applications, approve or reject reviewed applications, view audit trails
   - **Cannot**: Create applications, start reviews, request info, access admin functions
   - **Purpose**: Senior staff who make final licensing decisions

4. **ADMIN**
   - **Can**: All permissions (view all, manage users, full audit access)
   - **Purpose**: System administrators with full access

#### Why These Role Boundaries?

- **Separation of Duties**: Each role has distinct responsibilities in the workflow
- **Principle of Least Privilege**: Users only get permissions needed for their job
- **Audit Trail**: Clear accountability for each action
- **Scalability**: Easy to add new roles or modify permissions

### Decisions by requirement

#### 1. State Machine Design

**Requirement**: "State machine: every state, every valid transition, and the rules that govern them"

**Implementation**: Finite state machine with 8 states and controlled transitions using a transition matrix. All state changes are validated and audited.

**Trade-offs**:

- **Complexity vs Flexibility**: The strict state machine prevents invalid transitions but makes the workflow rigid. With more time, I'd add configurable workflows or conditional transitions.
- **Database vs Application Logic**: State validation happens in application code rather than database constraints for better error messages and audit logging.

**What I'd do differently**: Add support for custom workflows per license type, allowing different state machines for different application categories.

#### 2. Role-Based Access Control

**Requirement**: "Roles: every role, what they can and cannot do and why you drew the lines where you did"

**Implementation**: JWT-based authentication with role guards and decorators. Four roles with clear separation of duties.

**Trade-offs**:

- **Simple vs Granular**: Four roles provide clear separation but may be too coarse for large organizations. With more time, I'd implement permission-based access control with assignable permissions rather than fixed roles.
- **Guard vs Service Level**: Authorization enforced at controller level rather than service level for consistency, but this means service methods need to check ownership separately.

**What I'd do differently**: Implement a more flexible permission system where roles are collections of permissions, allowing for easier customization and finer-grained control.

#### 3. Audit Logging

**Requirement**: Comprehensive audit trail for compliance

**Implementation**: Synchronous audit logging within database transactions, capturing all state changes, document uploads, and user actions.

**Trade-offs**:

- **Performance vs Compliance**: Synchronous logging ensures consistency but adds latency to operations. With more time, I'd implement asynchronous logging with guaranteed delivery.
- **Storage vs Queryability**: JSONB metadata field allows flexible data storage but makes querying complex. I'd add structured tables for common audit patterns.

**What I'd do differently**: Implement event sourcing pattern with a proper event store, allowing for better analytics and system reconstruction.

#### 4. Data Model Relationships

**Requirement**: Schema for applications, users, documents, and audit log

**Implementation**: Normalized relational model with proper foreign keys and constraints.

**Trade-offs**:

- **Normalization vs Performance**: Fully normalized design ensures data integrity but requires multiple joins. With more time, I'd denormalize some fields for read performance.
- **UUID vs Sequential IDs**: UUIDs provide better security and distributed system support but are less efficient for indexing.

**What I'd do differently**: Use a hybrid approach with both UUIDs for external APIs and sequential IDs for internal relationships.

#### 5. File Storage

**Requirement**: Document management for applications

**Implementation**: Local file system storage with metadata in database.

**Trade-offs**:

- **Simple vs Scalable**: Local storage is simple to implement but doesn't scale. With more time, I'd integrate with cloud storage (S3) and add CDN support.
- **Security vs Accessibility**: Files stored outside web root for security, served through API endpoints.

**What I'd do differently**: Implement a proper document management system with versioning, thumbnails, and OCR capabilities.

#### 6. Transaction Management

**Requirement**: Data consistency across state changes

**Implementation**: Database transactions wrapping business operations and audit logging.

**Trade-offs**:

- **Consistency vs Complexity**: Transactions ensure atomicity but can cause deadlocks. With more time, I'd implement saga pattern for distributed transactions.
- **Blocking vs Optimistic**: Optimistic locking prevents conflicts but requires retry logic.

**What I'd do differently**: Use event-driven architecture with eventual consistency for better scalability.

#### Overall Architecture Trade-offs

**Monolithic vs Microservices**: Chose monolithic NestJS application for simplicity and development speed. With more time, I'd split into microservices (auth, applications, documents) with API gateway.

**TypeORM vs Raw SQL**: Used ORM for productivity but it can generate inefficient queries. With more time, I'd use a data mapper pattern with custom repositories.

**Synchronous vs Asynchronous**: Most operations are synchronous for simplicity. With more time, I'd implement background job processing for heavy operations like file processing or email notifications.

This design balances development speed, maintainability, and compliance requirements while acknowledging areas for future enhancement.
