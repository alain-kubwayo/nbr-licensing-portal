# NBR Licensing Portal — Backend

Bank Licensing & Compliance Portal API built with NestJS, TypeORM, and PostgreSQL.

## Prerequisites

- Node.js 20+
- pnpm
- Docker (for the database)

## Quick Start

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

Swagger documentation is available at `http://localhost:4000/docs`.

---

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

## API Overview

All protected endpoints require `Authorization: Bearer <token>`.

### Auth

| Method | Path        | Access   | Description         |
| ------ | ----------- | -------- | ------------------- |
| POST   | /auth/login | Public   | Obtain JWT token    |
| GET    | /auth/me    | REVIEWER | Get current profile |

### Applications

| Method | Path                              | Roles                     | Description              |
| ------ | --------------------------------- | ------------------------- | ------------------------ |
| POST   | /applications                     | APPLICANT                 | Create draft             |
| GET    | /applications                     | ALL                       | List applications        |
| GET    | /applications/:id                 | ALL                       | Get application          |
| GET    | /applications/:id/audit-trail     | REVIEWER, APPROVER, ADMIN | Get audit trail          |
| PATCH  | /applications/:id/submit          | APPLICANT                 | Submit for review        |
| PATCH  | /applications/:id/resubmit        | APPLICANT                 | Resubmit after info req  |
| PATCH  | /applications/:id/start-review    | REVIEWER                  | Assign self as reviewer  |
| PATCH  | /applications/:id/request-info    | REVIEWER                  | Request more information |
| PATCH  | /applications/:id/complete-review | REVIEWER                  | Complete review          |
| PATCH  | /applications/:id/approve         | APPROVER                  | Approve application      |
| PATCH  | /applications/:id/reject          | APPROVER                  | Reject application       |

### Documents

| Method | Path                                        | Roles     | Description       |
| ------ | ------------------------------------------- | --------- | ----------------- |
| POST   | /applications/:id/documents                 | APPLICANT | Upload document   |
| GET    | /applications/:id/documents                 | ALL       | List documents    |
| GET    | /applications/:id/documents/:docId/download | ALL       | Download document |

---

## Application Lifecycle

```
DRAFT → SUBMITTED → UNDER_REVIEW → INFO_REQUESTED → RESUBMITTED
                                 ↓
                         REVIEW_COMPLETED → APPROVED
                                          → REJECTED
```

Documents can only be uploaded when the application is in `DRAFT` or `INFO_REQUESTED` status.

---

## Available Scripts

| Script                    | Description                                        |
| ------------------------- | -------------------------------------------------- |
| `pnpm start:dev`          | Start in watch mode                                |
| `pnpm build`              | Compile TypeScript                                 |
| `pnpm migration:run`      | Run all pending migrations                         |
| `pnpm migration:generate` | Generate a new migration from entity changes       |
| `pnpm migration:revert`   | Revert the last migration                          |
| `pnpm seed`               | Seed the database with demo users and applications |
| `pnpm docker-db:start`    | Start PostgreSQL via Docker Compose                |
| `pnpm docker-db:stop`     | Stop PostgreSQL container                          |
