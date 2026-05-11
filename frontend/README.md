# NBR Licensing Portal — Frontend

Bank Licensing & Compliance Portal web UI built with React, TypeScript, and Vite.

## Prerequisites

- Node.js 20+
- pnpm

## Project setup

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` with your values. Typical local dev points at the backend:

```env
VITE_API_BASE_URL=http://localhost:4000/api/v1
```

### 3. Start the app

```bash
pnpm dev
```

The UI is available at `http://localhost:5173` (default Vite port).

---

## Roles (what each user can do)

This app supports multiple roles. You can use the seeded accounts from the backend (`backend/README.md`) to log in and explore each flow.

- **APPLICANT**
  - Create and manage their own applications (draft, submit, track status).
  - Upload supporting documents on the application detail page.
  - If a reviewer requests info (`INFO_REQUESTED`), the applicant can resubmit with a resubmission note.

- **REVIEWER**
  - See non-draft applications, start a review, request additional info, and complete the review.
  - Can open an application's audit trail from the Reviewer dashboard table or from the Applications list.

- **APPROVER**
  - See applications awaiting approval (`REVIEW_COMPLETED`) and approve/reject with a required decision note.
  - Can open an application's audit trail from the Approvals page or from the Applications list.

- **ADMIN**
  - View platform-wide dashboards and manage users (User Management).
  - Can view the Applications list and open an application's audit trail.

### Audit trail

Staff roles (**REVIEWER**, **APPROVER**, **ADMIN**) can view an application's audit trail via a dialog that calls:

- `GET /applications/:id/audit-trail`
