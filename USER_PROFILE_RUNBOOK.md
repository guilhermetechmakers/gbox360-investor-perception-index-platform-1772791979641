# User Profile — Runbook

This runbook describes how to test the dedicated User Profile page, simulate admin vs. user flows, and extend for SSO/audit.

## Route

- **User Profile:** `/dashboard/profile` (authenticated, inside dashboard layout)

Navigation: Dashboard sidebar → **Profile**. Ensure the user is logged in.

---

## What to test

### 1. Profile header (ProfileHeaderCard)

- **Read mode:** Avatar (initials if no image), display name, email, organization, role badge, SSO badge (if `is_sso_enabled`).
- **Edit mode:** Click **Edit** → inline inputs for name and organization; email read-only with helper text.
- **Save/Cancel:** Use the sticky **SaveBar** at bottom when there are unsaved header changes. **Save** → `PATCH /api/users/me` with `name`, `organization`. **Cancel** → revert draft to server values.

### 2. Preferences (ProfileDetailsForm)

- **Fields:** Phone, timezone (IANA list), language/locale, email visibility (team/private), notification toggles (email, in-app).
- **Validation:** Invalid phone format → inline error. Required timezone/locale.
- **Submit:** **Save preferences** → `PATCH /api/users/me` with `phone`, `timezone`, `locale`, `notification_preferences`.

### 3. Activity log (ActivityLogPanel)

- **List:** Recent actions with description, timestamp, action type. Empty state when no data.
- **Drill-down:** Click a row → expand to show event details (metadata JSON).
- **CSV export (admin only):** **Export CSV** button visible when `useCurrentUser().isAdmin === true`. Click → `POST /api/users/me/activity/export` → file download with headers.

### 4. Tenant users (AdminUserManagementPanel) — Admin only

- **Visibility:** Rendered only when `isAdmin && profile.tenant_id`.
- **List:** Tenant users with search and role filter. Empty state with **Invite member** CTA.
- **Invite:** Modal with email + role (Admin, Editor, Viewer). Submit → `POST /api/organizations/:tenantId/invite`.
- **Change role:** Per-user role dropdown → `PATCH /api/organizations/:tenantId/users/:userId`.
- **Remove:** **Remove** → confirmation → `DELETE /api/organizations/:tenantId/users/:userId`.

### 5. SaveBar

- **When visible:** Only when `isEditing && hasHeaderChanges` (name or organization changed).
- **Actions:** **Cancel** (revert and exit edit), **Save** (submit header + any details payload), **Delete account** (admin only; wire to backend when implemented).

---

## Simulating admin vs. user

- **Admin:** `authApi.getMe()` returns a role in `ADMIN_ROLES` (e.g. `PLATFORM_ADMIN`, `ENTERPRISE_ADMIN`). Then:
  - Activity log shows **Export CSV**.
  - **AdminUserManagementPanel** is visible; can invite, change roles, remove users.
  - SaveBar can show **Delete account** (if `showDelete` is true).
- **Non-admin:** Role e.g. `member` or `viewer`. Then:
  - No CSV export button.
  - No tenant users panel.
  - No Delete account in SaveBar.

Mock: set `role` in the `/auth/me` (or mock) response to control `useCurrentUser().isAdmin`.

---

## API contract (User Profile)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/users/me` | Current user profile (tenant_id, name, email, timezone, locale, role, is_sso_enabled, etc.) |
| PATCH | `/api/users/me` | Update profile (name, organization, phone, timezone, locale, notification_preferences) |
| GET | `/api/users/me/activity` | Recent activity list |
| POST | `/api/users/me/activity/export` | Generate and download CSV (admin) |
| GET | `/api/organizations/:tenantId/users` | List tenant users (admin) |
| POST | `/api/organizations/:tenantId/invite` | Invite user (admin) |
| PATCH | `/api/organizations/:tenantId/users/:userId` | Update user role (admin) |
| DELETE | `/api/organizations/:tenantId/users/:userId` | Remove user (admin) |

All require authentication. Admin-only endpoints must enforce role on the backend.

---

## Runtime safety

- Profile and activity: `data ?? null`, `(items ?? []).map(...)`, `Array.isArray(response?.data) ? response.data : []`.
- All array state: `useState<Type[]>([])`.
- Optional chaining for nested API fields; destructuring with defaults for response shapes.

---

## Extending

- **SSO:** `SSOStatusBadge` already shows when `is_sso_enabled`. Add password reset disable when SSO-only; wire **Delete account** to a dedicated endpoint with audit.
- **Audit:** Log profile updates, role changes, and user removal in `audit_logs`; expose in Admin Audit Logs.
- **Webhooks:** Add optional “Notify on profile change” in notification preferences and call existing webhook URL from backend on `PATCH /api/users/me`.
