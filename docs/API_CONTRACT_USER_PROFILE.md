# User Profile & Team Management — API Contract

This document defines the API contract used by the frontend for User Profile, Settings, and Admin User Management. Backend may be REST (Node) or Supabase Edge Functions + Postgres.

## Base URL

- Development: `VITE_API_URL` (e.g. `http://localhost:3000/api`)
- Auth: `Authorization: Bearer <token>` on all requests when logged in.

---

## Profile & Preferences

| Method | Endpoint | Description | Request | Response |
|--------|----------|--------------|---------|----------|
| GET | `/users/me` | Current user profile | — | `{ id, tenant_id, email, name, phone?, avatar_url?, timezone, locale, role, organization?, ... }` |
| PATCH | `/users/me` | Update profile | `{ name?, phone?, timezone?, locale?, organization?, notification_preferences? }` | Same as GET |
| POST | `/users/me/avatar` | Upload avatar | `multipart/form-data`: `avatar` (file) | `{ avatar_url }` or `{ avatarUrl }` |
| GET | `/users/me/activity` | Activity log | — | `Array<{ id, user_id, action_type, description, timestamp, metadata? }>` |
| POST | `/users/me/activity/export` | Export activity CSV | — | `Blob` (text/csv) |

| Method | Endpoint | Description | Request | Response |
|--------|----------|--------------|---------|----------|
| GET | `/settings` | Full settings payload | — | `{ profile, notifications[], apiKeys[], dataRefresh?, team?, sessions?, deliveryWindow?, mutedNotifications? }` |
| PUT | `/settings/profile` | Update profile (settings) | `{ name?, timezone?, language? }` | `UserProfile` |
| PUT | `/settings/notifications` | Update notification preferences | `{ preferences: [{ channel, enabled, frequency?, webhookUrl? }] }` | `NotificationPreference[]` |
| PUT | `/settings/delivery-window` | Delivery window | `{ start: "HH:mm", end: "HH:mm" }` | `{ start, end }` |
| PUT | `/settings/muted-notifications` | Muted until / channels | `{ until?: ISO8601, channels?: string[] }` | `{ until?, channels? }` |
| PUT | `/settings/data-refresh` | Data refresh prefs | `{ cadenceMs, batchProcessingEnabled? }` | `DataRefreshPreference` |
| GET | `/settings/team` | Team members (admin) | — | `TeamMember[]` or `{ items: TeamMember[] }` |
| POST | `/settings/team/invite` | Invite member | `{ email, role }` | `TeamMember` |
| POST | `/settings/team/:userId/role` | Update member role | `{ role }` | `TeamMember` |
| DELETE | `/settings/team/:userId` | Remove member | — | 204 |
| GET | `/settings/sessions` | Sessions | — | `Session[]` or `{ sessions: Session[] }` |
| POST | `/settings/sessions/terminate` | Terminate other sessions | — | 204 |
| POST | `/settings/api-keys` | Create API key | `{ label, scopes? }` | `{ id, label, maskedKey, secret }` |
| POST | `/settings/api-keys/:id/rotate` | Rotate key | — | `{ maskedKey, secret }` |
| DELETE | `/settings/api-keys/:id` | Revoke key | — | 204 |

---

## Tenant / Organization Users (Profile page & Admin)

| Method | Endpoint | Description | Request | Response |
|--------|----------|--------------|---------|----------|
| GET | `/organizations/:tenantId/users` | List tenant users | — | `TenantUser[]` or `{ data|items: TenantUser[] }` |
| POST | `/organizations/:tenantId/invite` | Invite user | `{ email, role }` | `{ id, email, role }` |
| PATCH | `/organizations/:tenantId/users/:userId` | Update user (e.g. role) | `{ role? }` | `TenantUser` or profile |
| DELETE | `/organizations/:tenantId/users/:userId` | Remove user | — | 204 |

---

## Admin User Management (full CRUD)

| Method | Endpoint | Description | Request | Response |
|--------|----------|--------------|---------|----------|
| GET | `/api/tenants/:tenantId/users` | List users (paginated) | Query: `page, pageSize, q, roleId, status` | `{ items: AdminUser[], count }` |
| POST | `/api/tenants/:tenantId/users` | Create user | Body per backend | `AdminUser` |
| GET | `/api/tenants/:tenantId/users/:userId` | Get user | — | `AdminUser` |
| PATCH | `/api/tenants/:tenantId/users/:userId` | Update user | Body per backend | `AdminUser` |
| DELETE | `/api/tenants/:tenantId/users/:userId` | Delete/deactivate user | — | 204 |
| POST | `/api/tenants/:tenantId/users/invite` | Send invite | `{ email, name?, tenantRoles[], expiresAt?, message? }` | Invite |
| POST | `/api/invites/:token/accept` | Accept invite | — | User + session |
| GET | `/api/audit-logs` | Audit logs | Query: `actorId, targetUserId, action, from, to` | `{ items: AuditLogEntry[], count? }` |

---

## Data Models (TypeScript)

- **UserProfileMe:** `id, tenant_id, name, email, phone?, avatar_url?, timezone, locale, role, organization?, is_active, is_sso_enabled, last_login_at?`
- **ActivityItem:** `id, user_id, action_type, description, timestamp, metadata?`
- **TenantUser:** `id, tenant_id, email, name?, role, is_active, invited_at?, status?`
- **SettingsPayload:** `profile, notifications[], apiKeys[], dataRefresh?, team?, sessions?, deliveryWindow?, mutedNotifications?`
- **DeliveryWindow:** `start: string, end: string`
- **MutedNotifications:** `until?: string, channels?: string[]`

---

## Validation Rules

- **Email:** Unique within tenant; format validated on client and server.
- **Timezone:** Valid IANA string (e.g. America/New_York).
- **Locale:** Supported language code (e.g. en, es).
- **Avatar:** Image type (JPEG, PNG, WebP, GIF); max 2MB.
- **API key scopes:** Validated against allowed scopes on create/rotate.
- **Invite token:** Verified on accept; expiry checked.

---

## Security

- All endpoints require authentication unless stated (e.g. invite accept may be public with token).
- RBAC: only admins for a tenant can manage tenant users and view audit logs.
- Admin actions must be written to `audit_logs` (actor_id, target_user_id, action, resource, timestamp, details).
- Secrets (API key secret, tokens) never returned after first display; store hashed.
