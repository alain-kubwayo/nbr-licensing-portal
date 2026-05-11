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
