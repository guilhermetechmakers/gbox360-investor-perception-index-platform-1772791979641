# Settings & Preferences — Runbook

This runbook describes how to test each panel on the Settings & Preferences page, how to simulate admin vs user flows, and how to extend for SSO and webhooks.

## Overview

- **Page:** `/dashboard/settings` (Settings & Preferences)
- **Tabs:** Profile, Notifications, API Keys, Data Refresh, Team (admin only), Two-factor, Sessions, Audit

---

## 1. Testing Each Panel

### Profile

- **Path:** `/dashboard/settings?tab=profile`
- **Actions:** Update name, timezone, language; view read-only email; open "Change password" and "Two-factor authentication" links.
- **Validation:** Name required; timezone/language must be selected. Save triggers `PUT /settings/profile` (or mock). Success toast and form resets.
- **Admin vs user:** Same for both. No RBAC difference on this tab.

### Notifications

- **Path:** `/dashboard/settings?tab=notifications`
- **Actions:** Toggle email, webhook, in-app; set frequency (instant, daily, weekly); set webhook URL; set delivery window (From/To time); set muted until (datetime or "Mute for 1 hour" / "Unmute").
- **Validation:** Webhook URL must be valid when enabled. Save notification preferences and Save window / Muted each trigger their own API calls.
- **Endpoints:** `PUT /settings/notifications`, `PUT /settings/delivery-window`, `PUT /settings/muted-notifications`.

### API Keys

- **Path:** `/dashboard/settings?tab=api-keys`
- **Actions:** Create key (label, optional scopes); copy secret once; rotate key; revoke key.
- **Validation:** Label required. Secret shown only once after create/rotate. Masked key shown in list.
- **Endpoints:** `POST /settings/api-keys`, `POST /settings/api-keys/:id/rotate`, `DELETE /settings/api-keys/:id`.

### Data Refresh

- **Path:** `/dashboard/settings?tab=data-refresh`
- **Actions:** Set polling cadence (1 min – 1 hour); admins can toggle batch processing. View last refresh time.
- **Validation:** Cadence required. Admin-only batch switch.
- **Endpoint:** `PUT /settings/data-refresh`.

### Team (Admin only)

- **Path:** `/dashboard/settings?tab=team`
- **Visibility:** Only when `useCurrentUser().isAdmin === true`.
- **Actions:** Invite by email and role; change role; remove member. Search and filter by role.
- **Endpoints:** `GET /settings/team`, `POST /settings/team/invite`, `POST /settings/team/:userId/role`, `DELETE /settings/team/:userId`.
- **Simulating admin:** Use an account with role in `ADMIN_ROLES` (see `src/types/auth.ts`). Or mock `getMe` to return `role: 'admin'`.

### Two-factor (MFA)

- **Path:** `/dashboard/settings?tab=mfa`
- **Actions:** Enable MFA (setup, verify); disable MFA with code.
- **Endpoints:** Auth API (MFA setup/verify/disable). See auth runbook.

### Sessions

- **Path:** `/dashboard/settings?tab=sessions`
- **Actions:** View current and other sessions (device, IP, last active). "Terminate other sessions".
- **Endpoints:** `GET /settings/sessions`, `POST /settings/sessions/terminate`.
- **Critical flow:** Terminate other sessions revokes all other tokens; only current session remains.

### Audit

- **Path:** `/dashboard/settings?tab=audit`
- **Actions:** View audit entries (if implemented). Admin-focused.

---

## 2. Simulating Admin vs User Flows

- **User (non-admin):** Log in with a user whose role is not in `ADMIN_ROLES`. Team tab is hidden. Data Refresh shows no batch processing toggle. Profile, Notifications, API Keys, Data Refresh, MFA, Sessions, Audit (if visible) behave the same except for these restrictions.
- **Admin:** Log in with role `admin` (or other admin role). Team tab appears. Data Refresh shows batch processing. Admin User Management page (`/admin/user-management`) is accessible when `DataAccessGuard` allows it.
- **Mocking in tests:** Override `useCurrentUser()` or the auth API to return `role: 'admin'` or `role: 'member'`.

---

## 3. Extending for SSO and Webhooks

### SSO

- **Backend:** Add OAuth/OIDC provider; store provider and external id on profile or auth metadata. Map identity to `profiles` by email or subject.
- **Frontend:** Settings can show "Connected to Acme SSO" and a "Disconnect" (if allowed). Invite flow can offer "Send invite via SSO" and use IdP group/role mapping.
- **Runbook:** Document which env vars (e.g. `VITE_OAUTH_*`) and which backend routes (e.g. `/auth/sso/callback`) are used.

### Webhooks

- **Notifications:** Already supported in Notifications panel (webhook URL, frequency). Backend must send POST to that URL with a signed payload.
- **New webhooks (e.g. company events):** Add a "Webhooks" tab or section: add endpoint URL, optional secret, events to subscribe. Backend stores in `user_preferences` or a `webhook_endpoints` table and invokes on events. Document payload shape and retry policy in API docs.

---

## 4. Critical Flows Checklist

- [ ] **Profile update:** Change name/timezone/language → Save → success toast and persisted values.
- [ ] **Key rotation:** Create key → copy secret → Rotate → new secret shown once; old key invalid.
- **Team invite (admin):** Invite by email + role → invite sent; appears in team list as "invited" until accept.
- **Session termination:** Click "Terminate other sessions" → confirm → all other sessions invalidated; only current session remains.

---

## 5. Runtime Safety

- All list responses are consumed with `data ?? []` or `Array.isArray(data) ? data : []`.
- API response shapes are normalized in `src/api/settings.ts` and `src/api/users.ts`; use the returned types on the client.
- Optional chaining and destructuring with defaults are used for nested fields.

---

## 6. Related Pages

- **User Profile:** `/dashboard/profile` — full profile, avatar upload, preferences summary, activity log, data refresh status, tenant users (admin).
- **Admin User Management:** `/admin/user-management` — tenant users CRUD, invite, audit trail. See project docs for that runbook.
