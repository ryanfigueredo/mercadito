# AI Coding Agent Project Instructions

Concise, project-specific guidance for automated changes. Focus on existing patterns; avoid introducing heavy abstractions prematurely.

## 1. Purpose & Stack
Mercadito: Brazilian mini e-commerce / grocery prototype built on Next.js App Router (v15) + TypeScript, Prisma (PostgreSQL), NextAuth (credentials), Mercado Pago integration, Tailwind UI, Zustand cart state.

Key scripts (see `package.json`):
- `pnpm dev` / `yarn dev`: start Next.js dev server
- `pnpm build`: runs `prisma generate` then `next build`

## 2. Data & Persistence
Defined in `prisma/schema.prisma`:
- Users (credentials auth), Addresses (1:N), Products (price stored as `priceCents` int), Orders (status enum), OrderItems (unitPriceCents snapshot). Monetary values ALWAYS stored/queried in cents server-side; convert to BRL numbers only at display.
- Use singleton Prisma client from `src/lib/prisma.ts` to avoid hot-reload leaks. Do not instantiate new clients.

## 3. Backend API Patterns (App Router route handlers)
Location: `src/app/api/**/route.ts`
- Validation: Use `zod` (`admin/products` POST) with `safeParse`; return 400 with structured error.
- Product creation uses `upsert` keyed by `slug` both in admin and checkout preference builder.
- Pagination example: `api/admin/orders` reads `page`, `pageSize` (caps at 50), builds `skip/take` and returns counts grouped by status.
- Order status transitions via `PATCH` + `action` switch; keep language of existing error messages (Portuguese) when adding new ones.
- Checkout preference (`api/checkout/preference`) flow: session -> ensure user -> upsert products -> create order (include freightCents constant) -> call Mercado Pago -> return `{ id, init_point }`.
- Webhook (`api/checkout/webhook`) is intentionally lenient; it sets Order to CONFIRMED if an `external_reference`/id matches. Keep idempotent & resilient (wrap in try/catch, always 200 JSON `{ ok: true }`).
- Dev seed endpoint (`api/dev/seed`) is idempotent using `upsert` and fixed IDs for some orders.

## 4. Auth
- Central config: `src/lib/auth.ts` (Credentials provider only). Passwords stored bcrypt-hashed EXCEPT dev seed user (`password: "dev"` plain) — avoid relying on this in production code.
- Session strategy: JWT. User id attached to token and injected into `session.user.id`.
- Always get session server-side with `getServerSession(authOptions)` (see checkout preference).

## 5. Frontend State & Components
- Client cart store: `src/lib/cart.ts` (Zustand) persists to `localStorage` under `mercadito_cart_v1`. Items identified by product slug.
- Static catalog seeds: `src/lib/products.ts`, category metadata: `src/lib/categories.ts`; may differ from DB — when reconciling, prefer DB truth for dynamic features, keep static arrays for placeholder UI.
- Utility class merge: `cn(...)` from `src/lib/utils.ts` (Tailwind + clsx + tailwind-merge).
- Currency formatting for mock orders: `formatBRL` in `src/lib/orders.ts`. For real monetary conversions: divide cents by 100 and format with locale `pt-BR`.

## 6. Conventions & Style
- Monetary fields DB: `*Cents` integer. Incoming floating price -> round with `Math.round(value * 100)` before persistence (see products route). Maintain this.
- Error messages & some field labels are Portuguese; keep language consistent unless adding user-facing i18n system.
- Use `upsert` for idempotent seeds and product syncing; prefer not to implement manual existence checks.
- Avoid adding global state libs beyond existing (Zustand + React Query placeholder). Reuse existing patterns.
- Keep environment variable names unchanged (`DATABASE_URL`, `MERCADOPAGO_ACCESS_TOKEN`, `MERCADOPAGO_WEBHOOK_SECRET`, `NEXTAUTH_URL`). Throw early if critical (see `mercadopago.ts`).

## 7. Adding New API Routes
Checklist:
1. Create `src/app/api/<segment>/route.ts` with exported HTTP verb functions.
2. Import shared prisma client; validate input with zod if mutating.
3. Return `NextResponse.json(...)` with proper status codes (400 validation, 401 unauthorized, 500 fallback). Keep minimal error shapes `{ error: string }`.
4. Maintain cents convention & consistent naming.

## 8. Testing & Seeding (Manual)
- Use `POST /api/dev/seed` during development to populate base data (idempotent).
- No automated test suite yet; if adding tests, colocate lightweight utility tests (e.g., CPF validation) under `__tests__/` mirroring path.

## 9. Safe Changes Examples
- When adding a discount: introduce `discountCents` on Order or OrderItem rather than altering stored `unitPriceCents`; compute derived totals server-side.
- Adding new order status: extend enum in Prisma, migrate, then update switch in `admin/orders` route and any status mapping UI components.

## 10. Anti-Patterns To Avoid
- Creating a new PrismaClient instance per request.
- Storing floats in DB for money.
- Mixing English/Portuguese error messages arbitrarily.
- Throwing instead of returning structured JSON errors in route handlers.

## 11. Open Improvement Opportunities (Optional)
Non-breaking enhancements you may propose but not auto-apply: rate limiting on admin endpoints, signature verification for Mercado Pago webhook, unifying mock vs DB product sources.

---
If anything above seems ambiguous (e.g., status flows, monetary handling), ask for clarification before large refactors.