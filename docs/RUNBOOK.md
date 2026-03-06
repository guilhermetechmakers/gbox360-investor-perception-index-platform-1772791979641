# Admin Audit, Monitoring & Replay — Runbook

How to test each admin panel, simulate admin vs user flows, and extend for SSO, webhooks, and Prometheus/Grafana.

## 1. Access and RBAC

- **Platform admins** and **enterprise account admins** can access all admin routes.
- Non-admin users are redirected to `/dashboard`; direct `/admin/audit-logs` or `/admin/data-replay` shows "Access denied".
- Unauthenticated users redirect to `/auth`.

**Test RBAC**: Log in as admin → `/admin` loads. Log in as non-admin → `/admin` redirects to `/dashboard`. No token → `/admin` redirects to `/auth`.

## 2. Admin Dashboard (`/admin`)

- **Action bar**: Run Health Check, Access Audit Logs link, Notify on ingestion fail toggle.
- **Ingestion Health**: Uptime %, error rate, latency; three Recharts when API returns metrics.
- **System Health**: Queue length, worker status, last successful job.
- **Quick navigation**: Audit Logs, Data Replay, User Management cards.
- **Tenant Summary** and **Alerts & Incidents**: Lists with empty states.

## 3. Audit Logs (`/admin/audit-logs`)

- **Filters**: Tenant, event types, actor, search, date range, per page. Clear filters resets.
- **Table**: Date/Time, Event type, Actor, Tenant, Event ID, Payload ID, Payload hash, Description, Retention, Payload (View). Pagination.
- **Export**: Format CSV | JSON; file uses selected format and current filters.
- **Payload**: View opens read-only modal.

## 4. Data Replay (`/admin/data-replay`)

- **Scope**: Tenant, time window. Preflight runs automatically.
- **Single event**: Event ID, Dry-run, Execute.
- **Replay controls**: Dry-run, Execute, Pause, Resume, Cancel; progress bar.
- **Job history**: View details links to Audit Logs filtered by job.
- Use `validateReplayRun()` from `@/lib/admin-validators` for run payloads.

## 5. API contract

- GET `/admin/dashboard-health`, POST `/admin/health-check`
- GET `/admin/audit-logs` (query params), POST `/admin/audit-logs/export` (body: format csv|json)
- GET `/admin/audit-logs/payload/:id`
- POST `/admin/data-replay/preflight`, POST `/admin/data-replay/run`, GET `/admin/data-replay/jobs`, GET `/admin/data-replay/jobs/:id/progress`

All admin endpoints must enforce RBAC.

## 6. Extending

- **SSO**: Map identity to same admin roles.
- **Webhooks**: Backend sends on ingestion failure; "Notify on fail" can be a saved preference.
- **Prometheus/Grafana**: Backend exposes ingestion_up, ingestion_latency, ingestion_error_rate.

## 7. Files

Routes: `App.tsx`. Layout/guards: `AdminLayout.tsx`, `AdminRouteGuard.tsx`, `DataAccessGuard.tsx`. Pages: `AdminDashboard.tsx`, `AdminAuditLogs.tsx`, `AdminDataReplay.tsx`. API: `api/admin.ts`, `hooks/useAdmin.ts`. Validators: `lib/admin-validators.ts`.
