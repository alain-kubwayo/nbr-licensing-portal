# NBR Licensing Portal

This is BNR's Bank Licensing & Compliance Portal built with:

- **Backend**: NestJS API + PostgreSQL + Swagger docs
- **Frontend**: React + TypeScript + Vite web UI

## The challenge

- Replace a **manual** licensing process (email, spreadsheets, informal handoffs) with a **single system of truth**: traceable workflow, enforced roles, and a **defensible audit trail** suitable for regulators.
- Requirements were **purposefully open-ended**; the product choices below are explicit trade-offs (what we optimised for vs what we deferred).


## Design & setup

To run the project, clone the repository, then for the frontend and the backend, you will follow README.md files inside `frontend` folder and `backend` folder respectively.

- **Design** (architecture, data model, state machine, trade-offs): **`backend/README.md`** (section *Design overview* at the bottom of that file)
- **Run the API** (DB, migrations, seed, `pnpm start:dev`): **`backend/README.md`** (commands from `backend/`)
- **Run the web UI** (`pnpm dev`): **`frontend/README.md`** (commands from `frontend/`)

## Prerequisites

- Node.js 20+
- pnpm
- Docker (for the database)

---

## Tests

From **`backend/`**: `pnpm test` (Jest—e.g. valid/invalid application status transitions in `src/applications/application.utils.spec.ts`).

## Reasoning & decisions

**Backend**

- **JWT**: stateless auth fits an API-first internal tool; role claims are checked on every protected route so bypassing the UI is not enough.
- **State machine in the service layer**: illegal transitions return API errors; terminal states (`APPROVED` / `REJECTED`) are treated as final in business logic.
- **Reviewer ≠ approver on the same application**: enforced when recording `reviewedBy` vs `approvedBy` so one person cannot both complete review and final decision.
- **Concurrency**: optimistic locking on applications (`version`) so two actors acting at once do not silently overwrite each other.
- **Audit**: append-only persistence model for lifecycle events (who, what, before/after status, metadata); no “edit audit row” path.
- **Documents**: metadata in PostgreSQL, files on disk for the exercise; size limits enforced server-side; resubmissions bump **revision** so prior uploads remain addressable.
- **API contract**: structured errors (no raw stack traces in responses); **Swagger** at `/docs` as the living API doc; **seed** gives one user per role plus applications across states so reviewers can run without manual DB work.

**Frontend**

- **Internal tool UX**: clarity over polish—role-aware navigation, obvious statuses, error states, and **Sonner** for showing alerts of errors returned by API in a UX-friendly fashion.

- **Security UX**: hide actions a role cannot perform (the backend remains authoritative).
- **No over-abstracted API layer**: direct `axios` calls next to screens where behaviour is obvious; avoids “robotic” indirection for a codebase this size.

## Roles in the UI

Use the seeded accounts in **`backend/README.md`** to try each role.

- **APPLICANT** — Create and submit applications, upload documents, resubmit after `INFO_REQUESTED`.
- **REVIEWER** — Work the review queue on the dashboard (start review, request info, complete review); audit trail from the applications list.
- **APPROVER** — Approve/reject from **Awaiting Approval** with a required decision note. Audit trail is available from the applications list.
- **ADMIN** — Dashboard totals, **User Management**.
