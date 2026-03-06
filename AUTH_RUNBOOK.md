# User Authentication & Account Management — Runbook

This runbook describes how to test each authentication and account-management flow, simulate admin vs. user roles, and extend for SSO and webhooks.

## Routes

| Route | Purpose |
|-------|--------|
| `/auth` | Unified login/signup (tabs: login, signup) |
| `/login` | Redirects to `/auth?tab=login` |
| `/signup` | Redirects to `/auth?tab=signup` |
| `/forgot-password` | Request password reset email |
| `/reset-password?token=...` | Set new password via emailed token |
| `/verify-email` | Email verification status and resend |
| `/dashboard` | Protected; requires auth |
| `/dashboard/settings` | Settings & Preferences (all panels) |
| `/dashboard/profile` | User profile and activity |

Protected routes redirect unauthenticated users to `/auth` with `state.from` set for post-login redirect.

---

## 1. Login / Signup (page_ui_login_signup)

### Login tab

**What to test:**

- Enter email and password; click **Log in** → `POST /auth/login` with `{ email, password, remember_me? }`.
- On success: token stored; redirect to `/dashboard` (or `from`).
- If backend returns `mfa_required: true` or error suggests MFA: **MFA prompt modal** opens; enter 6-digit TOTP code → `POST /auth/verify-mfa` → then redirect.
- **Forgot password?** → navigates to `/forgot-password`.
- Client-side validation: empty email/password show inline errors (Zod).
- Rate-limiting: if backend returns 429 or rate-limit message, show error in InlineErrorBox.

**SSO placeholder:** "Sign in with SSO" (or similar) → `POST /auth/sso`; if backend returns `url`, redirect to IdP; otherwise show toast that SSO is not configured.

### Signup tab

**What to test:**

- Company name, email, password, role (Analyst / IR / Admin), accept ToS.
- **Password strength meter** and rules (8+ chars, upper, lower, number, symbol). Submit with weak password → validation errors.
- Submit → `POST /auth/register` (or `/auth/signup` if backend uses that path) with normalized payload; on success redirect to `/verify-email`.
- Client-side validation and ToS checkbox required.

---

## 2. Password reset (page_ui_password_reset)

### Request reset (`/forgot-password`)

- Enter email → **Send reset link** → `POST /auth/password-reset-request` with `{ email }`.
- Success: "Check your email" message; no disclosure of whether email exists (security).
- Back to log in → `/auth`.

### Set new password (`/reset-password?token=...`)

- **Missing/invalid token:** Show "Invalid reset link" with CTA to request new link → `/forgot-password`.
- Valid token: Form with new password, confirm password; **password strength meter** and rules.
- Submit → `POST /auth/password-reset` with `{ token, newPassword }`.
- Success: "Password updated" and CTA to log in → `/auth`.

---

## 3. Email verification (page_ui_email_verification)

### With token in URL (`/verify-email?token=...`)

- Page auto-calls `GET /auth/verify-email?token=...` (or backend may use `GET /auth/verify?token=...`).
- States: **Verifying…** → **Email verified** (redirect to dashboard after short delay) or **Verification failed** (option to resend).
- **Resend verification email** → `POST /auth/resend-verification`; cooldown shown if returned.

### Post-signup (no token)

- User lands on `/verify-email` after signup. If logged in, show "Verify your email" and **Live status** (polling `GET /auth/verification-status`).
- **Resend verification email** with cooldown.
- When status becomes **verified**, redirect to dashboard.

### Not logged in

- If no token and no auth: prompt to log in or show "Please log in to verify your email."

---

## 4. Settings & Preferences (page_ui_settings)

See **SETTINGS_RUNBOOK.md** for panel-by-panel testing. Summary:

- **Profile:** Account details (name, email read-only, contact), timezone, language; links to change password and MFA.
- **Notifications:** Email, in-app, webhooks with validation.
- **API keys:** Create, reveal/copy, rotate, revoke; masked by default.
- **Data refresh:** Cadence and (admin) batch processing.
- **Team (admin only):** Invite, change role, remove members.
- **Two-factor:** Enable/disable MFA (setup QR + verify code).
- **Sessions:** List sessions; terminate other sessions.
- **Audit:** Link to `/admin/audit-logs` (admin only).

---

## 5. User profile (page_ui_user_profile)

**What to test:**

- **Profile header:** Name, email, organization, role; Edit → inline edit → Save/Cancel; `PATCH /users/me` (or `/user/profile`).
- **Profile details form:** Phone, timezone, locale, notification preferences; save updates.
- **Activity log:** Recent actions with pagination/search; admin: **Export CSV** → `POST /users/me/activity/export`.
- **Admin:** Team management panel (invite/add/remove, roles).
- **Role display:** Show `user.role` or `user.roles`; editing only where allowed by backend.

---

## 6. Session termination and logout

- **Logout:** UI calls `POST /auth/logout` and clears local token; redirect to `/auth`.
- **Terminate other sessions:** From Settings → Sessions → **Sign out all other sessions** → `POST /settings/sessions/terminate` (or equivalent); list refetches.

---

## Simulating admin vs. user

- **Admin:** `useCurrentUser().isAdmin === true` when `user.role` (or `user.roles`) is in `ADMIN_ROLES` (e.g. `PLATFORM_ADMIN`, `ENTERPRISE_ADMIN`). Enables:
  - Team tab and Audit link in Settings.
  - Batch processing in Data Refresh.
  - Admin user management on Profile.
- **User:** Role e.g. `Analyst`, `IR`, `member` → no Team tab, no Audit link, no batch toggle.

Mock or backend: ensure `GET /auth/me` returns the desired `role` or `roles` for testing.

---

## API contract summary (auth)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/auth/login` | Sign in; body `{ email, password, remember_me? }`; returns `{ token?, user?, mfa_required? }` |
| POST | `/auth/register` or `/auth/signup` | Sign up; body `{ email, password, company, role, accept_tos, ... }` |
| POST | `/auth/logout` | Revoke session; clear token |
| POST | `/auth/refresh` | Refresh access token (cookie or body); returns `{ token? }` |
| POST | `/auth/password-reset-request` | Request reset email; body `{ email }` |
| POST | `/auth/password-reset` | Set new password; body `{ token, newPassword }` |
| GET | `/auth/verify-email?token=` or `/auth/verify?token=` | Verify email token |
| GET | `/auth/verification-status?userId=` | Verification status (pending/verified/failed) |
| POST | `/auth/resend-verification` | Resend verification email; body `{ userId?, email? }` |
| POST | `/auth/mfa/setup` | Start MFA enrollment; returns secret/QR |
| POST | `/auth/mfa/verify` | Verify MFA code during enrollment; body `{ code }` |
| POST | `/auth/mfa/disable` | Disable MFA; body `{ code }` |
| POST | `/auth/verify-mfa` | Verify MFA during login; body `{ code, sessionId? }` |
| POST | `/auth/sso` | SSO placeholder; returns `{ url? }` |
| GET | `/auth/me` | Current user; returns `{ id, email, full_name?, display_name?, role?, roles?, mfa_enabled?, is_email_verified? }` |

---

## Runtime safety

- All API list responses consumed with `data ?? []` or `Array.isArray(x) ? x : []`.
- `useState<Type[]>([])` for array state; validate response shapes before mapping.
- No tokens or secrets in UI; API keys masked except ephemeral reveal on create/rotate.

---

## Extending for SSO and webhooks

- **SSO:** Wire `POST /auth/sso` and `GET /auth/sso/callback` to IdP; map SSO users to internal accounts; optional MFA after SSO when enabled.
- **Webhooks:** See SETTINGS_RUNBOOK.md (Notifications panel webhook URL; optional test webhook endpoint).
