# Intelligent Retail AI Platform

## Overview

A full-stack AI-driven retail platform built with React (frontend) and Node.js/Express (backend), connected to MongoDB Atlas. Features an AI shopping assistant powered by Google Gemini, real-time inventory management, demand forecasting, and a comprehensive retailer analytics dashboard.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite + Tailwind CSS + shadcn/ui + Recharts
- **Backend**: Express 5 + MongoDB Atlas (mongoose)
- **AI**: Google Gemini API (gemini-2.0-flash)
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## Environment Variables

- `MONGODB_URI` — MongoDB Atlas connection string
- `GEMINI_API_KEY` — Google Gemini API key
- `SESSION_SECRET` — Session secret

## Architecture

### Frontend (`artifacts/retail-platform/`)
- React + Vite at path `/`
- Pages: Dashboard, Products, Categories, Customers, Orders, Inventory, AI Assistant, AI Insights
- Uses React Query hooks from `@workspace/api-client-react`
- Recharts for analytics charts

### Backend (`artifacts/api-server/`)
- Express 5 API server at `/api`
- MongoDB Atlas via mongoose (no PostgreSQL/Drizzle used)
- Routes: products, categories, customers, orders, inventory, ai, analytics

### API Routes
- `GET/POST /api/products` — product catalog
- `GET/PATCH/DELETE /api/products/:id` — product management
- `GET/POST /api/categories` — categories
- `GET/POST /api/customers` — customers
- `GET/POST /api/orders` — orders
- `PATCH /api/orders/:id` — update order status
- `GET /api/inventory` — inventory levels
- `GET /api/inventory/alerts` — low stock / overstock alerts
- `PATCH /api/inventory/:productId` — update stock
- `POST /api/ai/chat` — AI shopping assistant (Gemini)
- `GET /api/ai/recommendations/:customerId` — product recommendations
- `GET /api/ai/demand-forecast` — AI demand forecasting
- `GET /api/ai/pricing-suggestions` — dynamic pricing
- `GET /api/analytics/dashboard` — dashboard KPIs
- `GET /api/analytics/sales-trends` — sales over time
- `GET /api/analytics/top-products` — top selling products
- `GET /api/analytics/recent-activity` — activity feed
- `GET /api/analytics/category-breakdown` — revenue by category

## Note on Database
The workspace has `lib/db` (Drizzle + PostgreSQL) but this project uses MongoDB Atlas directly via mongoose in the API server. The `lib/db` package is not used.

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
