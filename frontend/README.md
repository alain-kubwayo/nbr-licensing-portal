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
