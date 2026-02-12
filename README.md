# Inventory Management System (IMS) Web App

Production-ready React application for S&R Foods IMS based on the BRD, System Architecture Design,
and Process Design & Flows documentation. The UI supports inventory visibility, purchase order
management, transfers, forecasting, reporting, and role-based access control.

## Tech Stack

- React 18+ with TypeScript
- React Router v6 with protected routes and lazy loading
- Zustand for global state (auth + UI)
- React Query for data fetching and caching
- Tailwind CSS for responsive UI
- Axios for API client

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Install

```bash
npm install
```

### Run locally

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Preview production build

```bash
npm run preview
```

## Environment Variables

Create a `.env` file based on `.env.example`:

```
VITE_API_BASE_URL=https://api.example.com
```

## Application Structure

```
src/
├── components/
│   ├── auth/
│   ├── common/
│   └── layout/
├── config/
├── contexts/
├── data/
├── hooks/
├── pages/
├── services/
├── store/
├── types/
└── utils/
```

## Key UX Features

- Mobile-first responsive layout with sidebar + header navigation
- Skeleton loading states and error fallbacks
- Role-based access control (RBAC) with protected routes
- Toast notifications for async feedback
- Accessible form inputs with validation feedback

## API Integration

`src/services/api.ts` contains the Axios client with request/response interceptors. The app uses mock
data for now, but can be wired to real endpoints by updating the query functions in
`src/services/imsService.ts`.

Recommended endpoint patterns:

- `GET /api/dashboard/summary`
- `GET /api/inventory`
- `GET /api/purchase-orders`
- `GET /api/transfers`
- `GET /api/forecasts`

## Documentation Notes

- User flows and functional requirements align with the BRD.
- The UI is structured to support future integrations (QuickBooks, WMS, Shopify, Amazon, Faire).
- Accessibility targets WCAG 2.1 AA; ensure final UX validation and QA.

## Deployment

Use any static hosting provider (AWS S3 + CloudFront, Vercel, Netlify). Build output is in `dist/`.
