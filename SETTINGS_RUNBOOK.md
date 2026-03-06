# Settings & Preferences — Runbook

This runbook describes how to test each Settings panel, simulate admin vs. non-admin flows, and extend the feature for SSO and webhooks.

For **authentication flows** (login, signup, password reset, email verification, MFA, sessions), see **AUTH_RUNBOOK.md**.

## Routes

- **Primary:** `/dashboard/settings` (authenticated, inside dashboard layout)
- **User Profile:** `/dashboard/profile` (authenticated, full profile hub)
- **Redirect:** `/settings` → redirects to `/dashboard/settings`
- **Auth:** `/auth` (login/signup), `/forgot-password`, `/reset-password?token=...`, `/verify-email`
- **Protected:** Dashboard routes require authentication; unauthenticated users are redirected to `/auth`

Ensure the user is logged in; otherwise they are redirected to `/auth`.

---

## User Profile Page (`/dashboard/profile`)

**What to test:**

- **Profile header:** Avatar, name, email, organization, role. Click **Edit** → inline edit for name and organization. **Save** (check) or **Cancel** (X).
- **Profile details form:** Name, email (read-only), phone, organization, timezone, locale, notification preferences. Save → `PATCH /api/users/me`.
- **Activity log:** List of recent actions with timestamps. Click an item with metadata to expand and view event details.
- **CSV export (admin only):** **Export CSV** button visible when `isAdmin === true`. Click → `POST /api/users/me/activity/export`; file download.
- **Team management (admin only):** AdminUserManagementPanel (tenant users list) visible when admin. Invite, change role, remove.
- **Security section:** Change password link to `/forgot-password`; Two-factor authentication links to `/dashboard/settings?tab=mfa`.
- **SSO badge:** When `is_sso_enabled`, SSO badge shown in header.

**Data:** `GET /api/users/me`, `GET /api/users/me/activity`. Profile updates via `PATCH /api/users/me`.

---

## Panel-by-panel testing

### 1. Profile (UserProfilePanel)

**What to test:**

- Load the page: profile fields (name, email read-only, timezone, language) are populated from `GET /api/settings` (or mock).
- Edit name, timezone, language and click **Save changes**. Expect success toast and `PUT /api/settings/profile` (or mock update).
- Validation: clear name and save → inline error "Name is required".
- **Security section:**  
  - **Change password** links to `/forgot-password`.  
  - **Two-factor authentication** links to `/dashboard/settings?tab=mfa` for MFA setup/disable.

**Data:** `settings.profile` (UserProfile). Email is read-only; timezone/language must be from allowed sets (see `TIMEZONES`, `LANGUAGES` in `src/lib/settings-mock.ts`).

---

### 2. Notifications (NotificationsPanel)

**What to test:**

- Toggles for Email, Webhook, In-app; frequency selects when enabled.
- Enable Webhook and enter an invalid URL → inline error "Please enter a valid URL". Enter valid URL → error clears.
- Click **Save notification preferences** → `PUT /api/settings/notifications` with `{ preferences: [...] }`; success toast.

**Data:** `settings.notifications` (array of NotificationPreference). Channels: `email`, `webhook`, `in-app`. Frequencies: `instant`, `daily`, `weekly`. Webhook URL validated when webhook channel is enabled.

---

### 3. API Keys (ApiKeysPanel)

**What to test:**

- Empty state: no keys → "No API keys yet" and **Create API key** CTA.
- **Create key:** modal with label; submit → `POST /api/settings/api-keys`. New key appears with masked value; if backend returns `secret`, it is shown once with reveal/copy.
- **Reveal** (eye icon): toggles masked vs full secret when ephemeral secret exists. **Copy** copies secret to clipboard; toast on success/failure.
- **Rotate:** confirmation dialog → `POST /api/settings/api-keys/{id}/rotate`. New secret shown once; copy as above.
- **Revoke:** confirmation dialog → `DELETE /api/settings/api-keys/{id}`; key removed from list.

**Security:** Keys are masked by default. Plaintext secret only when returned on create/rotate and stored in ephemeral state; never logged.

---

### 4. Data Refresh (DataRefreshPanel)

**What to test:**

- Cadence dropdown (e.g. 1 min, 5 min, 15 min, 30 min, 1 hour). Select value and click **Save preferences** → `PUT /api/settings/data-refresh` with `{ cadenceMs, batchProcessingEnabled? }`.
- **Admin only:** "Batch processing" toggle is visible when `useCurrentUser().isAdmin === true`. Toggle and save; payload includes `batchProcessingEnabled`.
- Non-admin: batch section is hidden; save only sends `cadenceMs`.

**Data:** `settings.dataRefresh` (DataRefreshPreference). Plan limits can be enforced on the backend; UI shows "Last refresh" when present.

---

### 5. Team Management (TeamManagementPanel) — Admin only

**Visibility:** Tab "Team" is only rendered when `useCurrentUser().isAdmin === true`.

**What to test:**

- **List:** `GET /api/settings/team` (or mock). Table/cards with search and "Role" filter.
- **Search:** filter by name or email (debounced).
- **Filter by role:** dropdown All / Owner / Admin / Editor / Viewer.
- **Invite:** button opens modal; email + role. Submit → `POST /api/settings/team/invite`; new member appears with status "invited"; success toast.
- **Role change:** role dropdown per member → `POST /api/settings/team/{userId}/role` with `{ role }`.
- **Remove:** **Remove** opens confirmation; confirm → `DELETE /api/settings/team/{userId}`; member removed; success toast. Owner may be disabled for removal depending on backend.

**Data:** `settings.team` (TeamMember[]). Roles: `owner`, `admin`, `editor`, `viewer`. Status: `invited`, `active`, `disabled`.

---

### 6. Two-factor authentication (MFAPanel)

**What to test:**

- **Status:** Shows "Enabled" or "Not enabled" based on `user.mfa_enabled`.
- **Enable MFA:** Click **Enable MFA** → `POST /auth/mfa/setup`; QR code (or secret) displayed. Scan with authenticator app, enter 6-digit code → `POST /auth/mfa/verify`; success toast; status updates.
- **Disable MFA:** When enabled, click **Disable MFA** → enter current code → `POST /auth/mfa/disable`; success toast.
- **Tab from URL:** `/dashboard/settings?tab=mfa` opens the Two-factor tab directly.

**Data:** `GET /auth/me` returns `mfa_enabled`. MFA setup/verify/disable use auth endpoints.

---

### 7. Security & Sessions (SecuritySessionsPanel)

**What to test:**

- List of sessions (device, IP, last active). Current session highlighted.
- **Sign out all other sessions:** visible when there is at least one non-current session; click → `POST /api/settings/sessions/terminate`; success toast; list refetches.
- **Session timeout (optional):** dropdown (e.g. 15 min, 1 hour, 24 hours, 7 days). UI-only for now; backend can later persist and enforce.

**Data:** `settings.sessions` (Session[]). Each has `sessionId`, `device`, `ip`, `lastActive`, `current?`.

---

### 8. Audit & Raw Payloads (AuditAndPayloadPanel)

**What to test:**

- **Raw payload retention:** short copy and link to **Privacy Policy** (`/privacy-policy`).
- **Audit logs:** button links to `/admin/audit-logs` and is **only visible when `useCurrentUser().isAdmin === true`**. Non-admins do not see this link.

---

## Password reset flow

1. **Request reset:** User visits `/forgot-password`, enters email → `POST /auth/password-reset-request` with `{ email }`. Success: "Check your email" message.
2. **Set new password:** User clicks link in email (e.g. `/reset-password?token=...`). Enters new password with strength meter, confirms → `POST /auth/password-reset` with `{ token, newPassword }`. Success: redirect to `/auth`.
3. **Invalid token:** If token missing or invalid, page shows "Invalid reset link" with link to request new one.

---

## Simulating admin vs. non-admin

- **Admin:** User's role (from auth) is in `ADMIN_ROLES` (see `src/types/auth.ts`). Typically `owner`, `admin`, or similar. Then:
  - Team tab is visible.
  - Data Refresh shows "Batch processing" toggle.
  - Audit panel shows "Audit logs" link.
- **Non-admin:** Use a user with role e.g. `editor` or `viewer`. Then:
  - No Team tab.
  - No batch processing toggle.
  - No Audit logs link; only Privacy Policy.

Mock auth: ensure `authApi.getMe` (or mock) returns the desired `role` so `useCurrentUser().isAdmin` is true or false as needed.

---

## Extending for SSO and webhooks

### SSO (SAML/OAuth)

- Add a new tab or subsection "SSO" (or under Security). Show only when e.g. `tenant?.features?.sso` or an `enterpriseMode` flag is true.
- Add API endpoints, e.g. `GET/PUT /api/settings/sso` for configuration (idp URL, cert, etc.). Use forms with validation; secrets in inputs type="password" or masked.
- Call these from a new `SSOPanel` or similar; wire into `UnifiedSettingsEditor` when the feature flag is on.

### Webhooks (outgoing)

- Notifications panel already has webhook URL and validation. To add "Test webhook":
  - Add endpoint e.g. `POST /api/settings/notifications/test-webhook` with `{ url }` or use existing webhook URL from preferences. Backend sends a test payload and returns success/failure.
  - Add **Test** button next to webhook URL; on click call the endpoint and show toast with result.

### Incoming webhooks / API key scopes

- API key create flow can be extended with a scope selector (multi-select or checkboxes) from allowed scopes. Send `scopes` in `POST /api/settings/api-keys`.
- Backend should validate and store scopes and enforce them on API usage.

---

## Auth & Password Reset

**Password reset flow:**

1. User visits `/forgot-password`, enters email → `POST /auth/password-reset-request` { email }.
2. User receives email with link to `/reset-password?token=...`.
3. User enters new password (with strength meter) → `POST /auth/password-reset` { token, newPassword }.
4. Success → redirect to `/auth`.

**Password requirements:** Min 8 chars, uppercase, lowercase, number, symbol. Password strength meter shown on signup and reset.

---

## API contract summary

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/settings` | Full settings payload (profile, notifications, apiKeys, dataRefresh, team?, sessions?) |
| PUT | `/api/settings/profile` | Update name, timezone, language |
| PUT | `/api/settings/notifications` | Update preferences array |
| POST | `/api/settings/api-keys` | Create key; body `{ label, scopes? }` |
| POST | `/api/settings/api-keys/:id/rotate` | Rotate key; response includes new secret once |
| DELETE | `/api/settings/api-keys/:id` | Revoke key |
| PUT | `/api/settings/data-refresh` | Update cadenceMs, batchProcessingEnabled? |
| GET | `/api/settings/team` | List team members (admin) |
| POST | `/api/settings/team/invite` | Invite; body `{ email, role }` |
| POST | `/api/settings/team/:userId/role` | Update role; body `{ role }` |
| DELETE | `/api/settings/team/:userId` | Remove member |
| GET | `/api/settings/sessions` | List sessions |
| POST | `/api/settings/sessions/terminate` | Sign out other sessions |
| POST | `/auth/password-reset-request` | Request password reset email; body `{ email }` |
| POST | `/auth/password-reset` | Set new password; body `{ token, newPassword }` |
| POST | `/auth/mfa/setup` | Start MFA enrollment; returns secret/QR |
| POST | `/auth/mfa/verify` | Verify MFA code during enrollment; body `{ code }` |
| POST | `/auth/mfa/disable` | Disable MFA; body `{ code }` |

All endpoints require an authenticated user (except password-reset-request and password-reset). Team and data-plane admin actions must be restricted by role on the backend.

---

## Runtime safety

- All list data consumed with `safeArray(...)` or `(items ?? []).map(...)`.
- API response shapes validated; defaults used when fields are missing.
- No secrets logged; API keys masked in UI except ephemeral reveal/copy.
