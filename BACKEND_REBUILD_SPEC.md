# Hotel Management Backend — Rebuild Spec

**Read this whole file before writing any code.** It tells you how to restructure this backend into a feature-based architecture, what to keep from the current codebase, what to change, and the exact contract every endpoint must satisfy so it matches an already-built frontend.

## 0. Context

This is the backend for a hotel/hospitality establishment registration portal for the Akwa Ibom State Hotels and Tourism Development Commission. The **frontend is already fully built** (React + Vite + TypeScript, at `../hotel-management-frontend` relative to this repo) and calls the exact endpoints described in section 6. Your job is to restructure this backend's architecture and implement/complete every endpoint so the frontend works against it without any frontend changes.

Two sibling repos exist purely as **architectural references** — do not copy their business logic, only their code-organization conventions:
- `../../ikotekpene-tech/employment-databank-backend` — the feature-based architecture pattern to replicate (see section 1).
- `../../ikotekpene-tech/employment-databank-portal` — not relevant to backend work.

## 1. Architecture pattern to replicate

Copy this project's **flat feature-folder convention** exactly — no `src/features/` wrapper, no `src/shared/`, no `src/utils/`. Cross-cutting code lives in `src/configurations/`; each domain feature is a **top-level folder directly under `src/`**, fully self-contained.

**Per-endpoint layering, always in this order:**

```
route (Joi schema inline) → controller (thin, wrapped) → service (business logic, wrapped) → model (Sequelize, called directly — no repository/DAO layer)
```

This project currently uses a `repositories/` abstraction layer — **drop it**. Services call Sequelize models directly, matching the reference project.

### File conventions (copy verbatim style, adapt content)

**Route file** (`<feature>/<feature>.routes.ts`) — Joi schemas defined inline at the top, then route wiring:
```ts
import express from "express";
import Joi from "joi";
import validate from "../configurations/validate";
import authenticate from "../configurations/authenticate";
import { limiter } from "../configurations/rate-limit";
import register from "./controllers/register";

const router = express.Router();
const registerSchema = Joi.object({ /* ... */ });

router.post("/register", limiter, validate(registerSchema), register);
router.get("/me", authenticate, me);

export default router;
```

**Controller** (`<feature>/controllers/<action>.ts`) — one file per action, default export, always wrapped:
```ts
import { Request, Response } from "express";
import errorUtilities from "../../configurations/error-handler";
import responseUtilities from "../../configurations/response";
import registerService from "../services/register.service";

const register = errorUtilities.withControllerErrorHandling(
  async (request: Request, response: Response) => {
    const result = await registerService(request.body);
    return responseUtilities.responseHandler(response, result.message, result.statusCode, result.data);
  },
);
export default register;
```

**Service** (`<feature>/services/<action>.service.ts`) — wrapped, throws via `createError`, returns via `handleServicesResponse`:
```ts
const registerService = errorUtilities.withServiceErrorHandling(
  async (payload: RegisterPayload) => {
    // business logic, direct Sequelize calls
    if (existing) throw errorUtilities.createError("An account with this email already exists", StatusCodes.BAD_REQUEST);
    return responseUtilities.handleServicesResponse(StatusCodes.CREATED, "Account created", data);
  },
);
export default registerService;
```

**Model** — plain `class X extends Model<XAttributes> {}` + `X.init({...}, { sequelize: database, tableName, timestamps: true })`, lives **inside its owning feature folder** (e.g. `auth/User.ts`, `establishments/HospitalityEstablishment.ts`), not in a central `models/` folder.

**Naming:** kebab-case action files (`login-request-otp.ts`), default-exported as the camelCase name of that action. Feature routers named `<feature>.routes.ts`. Multi-word feature folders use camelCase (not kebab-case) if needed, but this project only needs single-word top-level folders (see section 2).

### Cross-cutting `src/configurations/` files to add (this project doesn't have most of these yet — add them, following the reference project's actual code closely; this project already has `jsonwebtoken`, `bcryptjs`, and `joi` installed so no new auth/validation dependencies are needed):

- `validate.ts` — generic Joi validation middleware (exact pattern shown in section 1 reference above): `(schema) => (req, res, next) => { const {error, value} = schema.validate(req.body, {abortEarly:false, stripUnknown:true}); ... req.body = value; next(); }`
- `error-handler.ts` — `createError(message, statusCode, data?)`, `createUnknownError(error)`, `withControllerErrorHandling(fn)`, `withServiceErrorHandling(fn)`, `globalErrorHandler`, `processErrorHandler()`. This project already has an equivalent in `src/utilities/errorHandlers/errorHandlers.utilities.ts` — **merge/rename into `configurations/error-handler.ts`** rather than building from scratch; keep its existing behavior if equivalent.
- `response.ts` — `responseHandler(response, message, statusCode, data)` and `handleServicesResponse(statusCode, message, data)`, producing `{ status: "success"|"error", message, data }`. This project already has an equivalent in `src/utilities/responseHandlers/response.utilities.ts` — merge/rename, keep the envelope shape (the frontend expects a `data` key wrapping the payload on every success response, and a `message` string key on every error response — do not change this envelope shape).
- `statusCodes.ts` — this project already has `src/constants/statusCodes.constants.ts`; just relocate/rename into `configurations/`.
- `rate-limit.ts` — **new**, add `express-rate-limit` as a dependency, export a `limiter` (e.g. 10 req/min) and apply it to all OTP-sending, login, and password-reset routes to prevent abuse.
- `authenticate.ts` — **keep this project's existing, more capable implementation** (`src/middlewares/authorization.middleware.ts`'s `generalAuthFunction`, which already supports access+refresh token rotation via `x-access-token`/`x-refresh-token` headers) rather than the reference project's simpler no-refresh version. Relocate it to `configurations/authenticate.ts`, keep its behavior. Keep `rolePermit(roles)` alongside it for role checks.
- `jwt.ts` — this project's existing token generation lives in `src/helpers/generalHelpers/generalHelpers.helpers.ts` (`generateTokens`). Extract just the sign/verify pieces into `configurations/jwt.ts`, keep using `process.env.APP_SECRET` (already set in `.env`).
- `database.ts`, `email.ts` / `email-queue.ts`, `sms` — relocate this project's existing working implementations (Sequelize/Neon connection, the active SendGrid-relay-via-nodemailer sender + Bull/Redis queue, Termii SMS client) into `configurations/`, keep them functioning as-is. Do not swap to Resend — this project's nodemailer+SendGrid path is already working, keep it.
- `nin-provider.ts` — this project already has `src/configurations/nin-provider.ts` with a working `verifyNIN(nin)` call to LumiID. **It is currently built but never called anywhere — wire it into the new `auth` feature's NIN-lookup endpoint** (section 6). Confirm/adjust the response mapping so it returns `{ nin, firstName, lastName, dateOfBirth, gender?, photo? }` (map LumiID's actual field names into this shape inside the service, not the route).
- `utils.ts` — small generic helpers (phone formatting, title-case, date checks) if useful; not critical.

Recommended addition not present in either reference: since `User.nin` is sensitive PII, consider field-level encryption at rest (AES-256-GCM) the same way the reference project encrypts `nin`/`vin` on its `User` model via Sequelize getters/setters (see its `configurations/encryption.ts` for the pattern). Not a hard requirement, but flagged as a security best practice worth adopting.

## 2. Target folder structure

```
src/
├── app.ts
├── routes/
│   └── index.ts                    # mounts every feature router: /auth, /establishments, /analytics, /admin
├── configurations/                  # see section 1 — all cross-cutting code
│   ├── index.ts / development.ts / production.ts   (keep existing)
│   ├── database.ts
│   ├── syncDb.ts                    # side-effect imports every model + database.sync()
│   ├── authenticate.ts              # owner/admin JWT auth (generalAuthFunction, relocated)
│   ├── jwt.ts
│   ├── validate.ts
│   ├── error-handler.ts
│   ├── response.ts
│   ├── statusCodes.ts
│   ├── rate-limit.ts
│   ├── email.ts / email-queue.ts
│   ├── sms.ts                       # Termii, relocated (kept dormant unless you decide to re-add phone OTP)
│   ├── nin-provider.ts
│   └── constants.ts                 # the 31 Akwa Ibom LGA list, lives ONCE here (see section 4)
│
├── auth/                            # owner-facing auth — NIN, registration, login, profile
│   ├── User.ts                      # model (see section 5)
│   ├── auth.routes.ts
│   ├── auth.helpers.ts              # OTP gen/hash, serializeUser, etc.
│   ├── controllers/
│   │   ├── nin-lookup.ts
│   │   ├── register.ts
│   │   ├── verify-email-otp.ts
│   │   ├── resend-email-otp.ts
│   │   ├── login.ts
│   │   ├── login-request-otp.ts
│   │   ├── login-verify-otp.ts
│   │   ├── forgot-password.ts
│   │   ├── reset-password.ts
│   │   ├── me.ts                    # GET /auth/me
│   │   ├── update-me.ts             # PATCH /auth/me
│   │   ├── change-password.ts       # POST /auth/change-password
│   │   └── logout.ts
│   ├── services/                    # one per action, mirrors controllers
│   └── emailTemplates/
│       ├── emailVerificationOtp.ts
│       ├── loginOtp.ts
│       └── passwordResetRequested.ts
│
├── establishments/                  # owner-facing establishment CRUD
│   ├── HospitalityEstablishment.ts  # model (see section 5) — now also represents branches (self-FK)
│   ├── EstablishmentCounter.ts      # model, kept from current codebase
│   ├── associations.ts              # HospitalityEstablishment.ownerId -> User, self-FK for branches
│   ├── establishments.routes.ts
│   ├── helpers/
│   │   └── unique-business-id.helpers.ts   # ported from existing establishmentHelpers, fix the format to actually match "AK-LG-TYPE-0001" (no random suffix) as documented
│   ├── controllers/
│   │   ├── search.ts                # GET /establishments/search
│   │   ├── list-mine.ts             # GET /establishments/mine
│   │   ├── get-one.ts               # GET /establishments/:id
│   │   ├── create.ts                # POST /establishments
│   │   ├── update.ts                # PATCH /establishments/:id (also handles claim)
│   │   ├── bulk-create.ts           # POST /establishments/bulk
│   │   ├── create-draft.ts          # POST /establishments/draft
│   │   ├── update-draft.ts          # PATCH /establishments/draft/:id
│   │   ├── submit-draft.ts          # POST /establishments/draft/:id/submit
│   │   ├── bulk-create-draft.ts     # POST /establishments/bulk/draft
│   │   ├── add-branch.ts            # POST /establishments/:id/branches
│   │   ├── update-branch.ts         # PATCH /establishments/branches/:branchId
│   │   └── delete-branch.ts         # DELETE /establishments/branches/:branchId
│   └── services/                    # one per action
│
├── analytics/                       # owner-scoped analytics (separate from admin's cross-owner analytics)
│   ├── analytics.routes.ts
│   ├── controllers/
│   │   ├── summary.ts               # GET /analytics/summary
│   │   └── export.ts                # GET /analytics/export
│   └── services/
│
└── admin/                           # everything admin-only, self-contained
    ├── utils/                       # admin-specific formatting/export helpers (e.g. the xlsx builder)
    ├── helpers/                     # admin-specific helpers (e.g. approval-state transition rules)
    └── features/
        ├── auth/                    # admin login (create-admin should NOT be open — see section 7)
        │   ├── admin-auth.routes.ts
        │   ├── controllers/{login,create-admin}.ts
        │   └── services/
        ├── establishments/          # admin review/moderation of ALL owners' establishments
        │   ├── admin-establishments.routes.ts
        │   ├── controllers/{list,get-one,approve,reject,update,bulk-add}.ts
        │   └── services/
        └── analytics/                # cross-owner analytics for the admin dashboard
            ├── admin-analytics.routes.ts
            ├── controllers/summary.ts
            └── services/
```

`routes/index.ts` mounts: `router.use("/auth", authRouter); router.use("/establishments", establishmentsRouter); router.use("/analytics", analyticsRouter); router.use("/admin", adminRouter);` — final URL shape `/api/v1/<feature>/...`, matching the existing `/api/v1` prefix already set up in `app.ts`.

**What to delete/retire during the move:** `src/repositories/`, `src/models/` (moved into feature folders), `src/controllers/`, `src/services/`, `src/routes/` old contents (replaced), `src/helpers/`, `src/utilities/` (content relocated into `configurations/` or feature folders as noted above), `src/validations/` (Joi schemas move inline into each `*.routes.ts` file per convention), `src/migrations/create-subscription-plans.ts` (dead code from an unrelated project — delete it), `check.html` (unrelated leftover file at repo root — delete it), `src/services/userServices/userServices.ts` and `src/routes/userRoutes/userRoutes.ts` (dead/commented-out code from a different app — delete, replaced by the new `auth/` feature).

## 3. Dependencies

**Keep as-is (already correct for this stack):** `express`, `sequelize`, `pg`, `joi`, `jsonwebtoken`, `bcryptjs`, `nodemailer`, `bull`, `axios` (used by both Termii and the NIN provider), `helmet`, `cors`, `cookie-parser`, `morgan`, `dayjs`, `uuid`.

**Add:** `express-rate-limit` (rate limiting on sensitive routes), `exceljs` (for `/analytics/export`, see section 6).

**Remove (installed but unused/dead — clean these up):** `@sendgrid/mail`, `@sendgrid/client` (nodemailer already handles SendGrid via SMTP relay), `resend` (not actually wired), `multer`, `multer-storage-cloudinary`, `cloudinary` (entirely commented out, no upload feature exists in the frontend to justify it), `qrcode` (no QR feature in the new frontend), `xss-clean` (installed but never applied as middleware — either wire it in or drop it), `moment` if referenced (it's used in `adminServices/adminService.ts` but not declared as a dependency at all — replace that usage with `dayjs`, already a real dependency, instead of adding `moment` properly).

**Move everything into `devDependencies` that belongs there** (`typescript`, `ts-node`, `nodemon`, `eslint`, `@types/*`) — currently everything sits in `dependencies` with no `devDependencies` block at all.

**Testing:** `package.json` references `jest` in scripts but it isn't installed and no tests exist. Either install `jest`/`ts-jest`/`@types/jest` and add a minimal smoke test, or remove the non-functional `test`/`test:watch` scripts. Not a priority — note it, don't block on it.

## 4. Fixes and consolidations to make while you're in there

- **Centralize the 31 Akwa Ibom LGA list.** It's currently duplicated three times (Joi validator, Sequelize model `isIn`, `establishmentHelpers` LG-code map). Put it once in `configurations/constants.ts` and import everywhere. Exact list (order doesn't matter, must match exactly — this is also the exact list the frontend already has in `shared/content/localGovernments.ts`):
  `Abak, Eastern Obolo, Eket, Esit Eket, Essien Udim, Etim Ekpo, Etinan, Ibeno, Ibesikpo Asutan, Ibiono Ibom, Ika, Ikono, Ikot Abasi, Ikot Ekpene, Ini, Itu, Mbo, Mkpat Enin, Nsit Atai, Nsit Ibom, Nsit Ubium, Obot Akara, Okobo, Onna, Oron, Oruk Anam, Udung Uko, Ukanafun, Uruan, Urue-Offong/Oruko, Uyo`
- **Consolidate the two divergent establishment Joi schemas** (`businessRegistrationSchema` vs `hotelSchema`/`bulkHotelSchema`) into ONE schema used by every establishment-creation path (owner create, owner bulk, owner draft [loose variant], admin bulk-add).
- **`POST /establishments` must return the created record**, including its generated `uniqueBusinessId`, in the response `data` — today it returns only a message with no data. The frontend depends on the created record.
- **Fix `uniqueBusinessId` generation** to actually match its documented format `AK-LG-TYPE-0001` (currently has an extra random nanoid segment not matching the doc comment) — sequential per `EstablishmentCounter` prefix, no randomness, so the format is predictable.
- **The old phone-OTP-for-establishment-registration flow (`OtpModel`, `send-registration-otp`/`verify-registration-otp`, Termii SMS) is no longer used by the new frontend at all** — the new registration flow does NIN + email OTP only, no business-phone OTP step. You can leave `OtpModel`/Termii code in place dormant, or remove it — your call, just don't wire it into any new route, and don't block on preserving it.
- **`admin/create-admin` is currently a fully open, unauthenticated endpoint** that lets anyone create an admin account. Fix this: either require an existing authenticated admin (`authenticate` + `rolePermit([Roles.Admin])`) to create additional admins, or gate it behind a one-time setup token read from an env var. Do not ship it open.
- **The current admin "approve" endpoint just toggles Approved/Rejected** based on current status with no `rejectionReason` handling. Rebuild it as two explicit actions: `approve` (sets `registrationStatus = "Approved"`, `approvedAt = now()`, `approvedBy = <admin id>`) and `reject` (sets `registrationStatus = "Rejected"`, requires a `rejectionReason` in the body). Admin review only applies to `Pending` establishments — `Draft` ones are owner-only and should never appear in the admin review queue.

## 5. Model changes

### `User` (relocate to `auth/User.ts`)

Add these fields to the existing model (keep existing `id`, `fullName`, `email`, `role`, `password`, `refreshToken` — `fullName` can stay for backward compatibility but the frontend now primarily uses `firstName`/`lastName`):

| Field | Type | Notes |
|---|---|---|
| `nin` | STRING(11), unique | set at registration, verified via LumiID before the row is created |
| `firstName` | STRING, allowNull:false | from NIN, user-editable at registration |
| `lastName` | STRING, allowNull:false | from NIN, user-editable at registration |
| `dateOfBirth` | DATEONLY, allowNull:false | from NIN, not user-editable |
| `phoneNumber` | STRING, allowNull:false | validated with the existing Nigerian phone regex: `/^(0[789][01]\d{8}|234[789][01]\d{8})$/` |
| `emailVerified` | BOOLEAN, default false | gates password login until true (403 if attempting login while false) |
| `emailOtpHash` | TEXT, nullable | bcrypt hash of the current outstanding email OTP (covers both signup verification and login-via-OTP — same field, different flow triggers it) |
| `emailOtpExpiresAt` | DATE, nullable | |
| `passwordResetTokenHash` | TEXT, nullable | for forgot/reset password |
| `passwordResetExpiresAt` | DATE, nullable | |

Keep existing `Roles` enum (`User = "user"`, `Admin = "admin"`) as-is — the frontend's own `UserRole` type (`"owner" | "admin"`) is a display-only type and does not strictly validate against this string at runtime, so no backend rename is required. Just make sure new NIN-registered accounts get `role: Roles.User`.

### `HospitalityEstablishment` (relocate to `establishments/HospitalityEstablishment.ts`)

Add:

| Field | Type | Notes |
|---|---|---|
| `ownerId` | UUID, nullable, FK → `User.id` | nullable so pre-seeded establishments can exist unowned until an owner claims them |
| `parentEstablishmentId` | UUID, nullable, FK → `HospitalityEstablishment.id` (self) | represents a branch's parent record; a branch is just another row of this same table |

**Change `RegistrationStatus`'s exact enum values** — this is important, the frontend does exact string matching against these values for status badges, filters, and sorting. Replace the current lowercase enum with:
```ts
export enum RegistrationStatus {
  Draft = "Draft",
  Pending = "Pending",
  Approved = "Approved",
  Rejected = "Rejected",
}
```
Drop `UnderReview` — the frontend has no UI state for it. `"Approved"` is what the frontend displays as **"Licensed"**; `"Pending"`/`"Rejected"` are both counted as **"Unlicensed"** in the analytics summary; `"Draft"` is counted separately as drafts.

`EntityType` enum values are already correct and need no change (`hotel`, `bar`, `restaurant`, `lounge`, `tour_operator`, `travel_agent`, `hospitality_org`, `other` — confirmed to match the frontend's `entityTypeOptions` exactly).

Relax `allowNull`/`notEmpty` validators to `true`/optional for every field **except** `entityType` and `ownerId`, since a Draft-status row can legitimately be missing most fields. Enforce "is this actually complete" only at the point a Draft transitions to Pending (the `submit` endpoints in section 6) — reuse the SAME Joi schema used by `POST /establishments` for that check, applied there instead of at draft save time.

Add a Sequelize association: `HospitalityEstablishment.hasMany(HospitalityEstablishment, { as: "branches", foreignKey: "parentEstablishmentId" })`, so `GET /establishments/:id` can eager-load `branches` directly.

### `EstablishmentCounter`

No changes needed — keep as-is, relocated into `establishments/`.

### OTP

No new generic OTP table needed. Email OTP (signup verification + login-via-OTP) is handled via the `emailOtpHash`/`emailOtpExpiresAt` columns added to `User` directly (see above) — this matches the reference project's pattern and is simpler than a polymorphic OTP table. The existing `OtpModel` (phone-OTP-for-establishments) is retired per section 4.

## 6. Full endpoint contract

All responses use the existing envelope: success → `{ status: "success", message, data }` (frontend reads `response.data.data`), error → `{ status: "error", message, ... }` (frontend reads `response.data.message`, or falls back to a raw string body, or `error.message`). Keep this envelope exactly as the current `response.utilities.ts` already produces it.

All `/establishments/*` and `/auth/me`, `/auth/change-password` routes (except `search`? — no, search too) require `authenticate` and operate on `request.user.id` as the owner. All `/admin/*` routes require `authenticate` + `rolePermit([Roles.Admin])`.

### Auth (`/api/v1/auth`)

**`POST /auth/nin-lookup`**
Request: `{ nin: string }` (11 digits)
→ calls `configurations/nin-provider.ts`'s `verifyNIN(nin)`, maps the LumiID response into:
Response `data`: `{ nin, firstName, lastName, dateOfBirth, gender?, photo? }`

**`POST /auth/register`**
Request: `{ nin, firstName, lastName, dateOfBirth, email, phoneNumber, password }`
- Validate `phoneNumber` against the Nigerian regex, `password` min 8 chars, `email` format, `nin` 11 digits.
- Reject if `email` or `nin` already exists on another `User`.
- Hash password (bcryptjs), create `User` with `role: Roles.User`, `emailVerified: false`.
- Generate a 6-digit numeric OTP, bcrypt-hash it into `emailOtpHash`, set `emailOtpExpiresAt` (10 min), email it via the existing nodemailer/SendGrid + Bull queue.
Response `data`: `{ email }`

**`POST /auth/verify-email-otp`**
Request: `{ email, otp }`
- Look up user by email, compare `otp` against `emailOtpHash` (bcrypt compare), check `emailOtpExpiresAt` hasn't passed.
- On success: `emailVerified = true`, clear `emailOtpHash`/`emailOtpExpiresAt`.
Response: success message, no data needed.

**`POST /auth/resend-email-otp`**
Request: `{ email }` → regenerates and re-sends the OTP (rate-limited, e.g. once per minute).

**`POST /auth/login`**
Request: `{ email, password }`
- If user not found or password mismatch → 400/401.
- If `emailVerified === false` → **403** specifically (the frontend's `PasswordLoginForm` catches exactly a 403 status to redirect to the verify-email screen — this status code matters).
- On success: sign JWT (`signToken({ sub: user.id }, ...)` using the existing `APP_SECRET`-based mechanism, reuse the current access+refresh token issuance already built in `authorization.middleware.ts`).
Response `data`: `{ token, user }` where `user` matches the shape in section 6a below. **Field name must be `token`, not `accessToken`.**

**`POST /auth/login/request-otp`**
Request: `{ email }` → generates+emails a login OTP the same way as signup (reuse `emailOtpHash`), rate-limited.

**`POST /auth/login/verify-otp`**
Request: `{ email, otp }` → verify like `verify-email-otp`, then issue a session the same way `login` does.
Response `data`: `{ token, user }`

**`POST /auth/forgot-password`**
Request: `{ email }` → always responds success regardless of whether the email exists (don't leak account existence); if it does exist, generate a reset token, hash into `passwordResetTokenHash`, set `passwordResetExpiresAt`, email a reset link containing the raw token.

**`POST /auth/reset-password`**
Request: `{ token, password }` → look up by hashing the incoming token and matching `passwordResetTokenHash` (or store the raw token as a signed JWT with `purpose: "reset-password"` and verify it instead, either approach is fine), check expiry, set new hashed password, clear reset fields.

**`GET /auth/me`** (authenticated)
Response `data`: current `User` in the shape below.

**`PATCH /auth/me`** (authenticated)
Request: `{ firstName, lastName, phoneNumber }` — validate phone regex. `nin`, `email`, `dateOfBirth` are NOT editable here.
Response `data`: updated `User`.

**`POST /auth/change-password`** (authenticated)
Request: `{ currentPassword, newPassword }` → verify current password matches, then set new hashed password.

**`POST /auth/logout`** (authenticated) → invalidate refresh token (clear `User.refreshToken`, matching existing behavior).

#### 6a. `User` response shape (used by `/auth/*` and embedded in `AuthSessionResponse`)
```ts
{
  id: string;
  fullName?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  email: string;
  phoneNumber?: string | null;
  nin?: string | null;
  dateOfBirth?: string | null;   // ISO date string
  role: "user" | "admin";
  emailVerified: boolean;
}
```
Never include `password`, `refreshToken`, `emailOtpHash`, `passwordResetTokenHash` in any response — strip them in a serializer helper (`auth.helpers.ts`'s `serializeUser`, matching the reference project's pattern).

### Establishments (`/api/v1/establishments`) — all authenticated

**`GET /establishments/search?q=<string>`**
Debounced-search endpoint (the frontend debounces client-side, ~450ms, so this can be a simple `ILIKE '%q%'` query, no need for full-text search infrastructure). Search across **all** establishments regardless of owner (so an owner can find pre-seeded unclaimed records or records claimed by someone else).
Response `data`: array of
```ts
{ id, businessName, entityType, localGovernment, ownerId: string | null }
```

**`GET /establishments/mine`**
All establishments where `ownerId = request.user.id`, **top-level (parent) records only** — do not flatten branches into this list; each returned establishment should include its own `branches` array (see `Establishment` shape below) so the frontend can show a branch count per row.
Response `data`: array of `Establishment`.

**`GET /establishments/:id`**
Full detail including eager-loaded `branches`. Authorization: allow if `ownerId === request.user.id` OR `ownerId === null` (so the claim flow can fetch an unclaimed record's details before claiming it).

**`POST /establishments`**
Full validation (the consolidated schema from section 4), `entityType`-conditional required fields (hotel-like → `roomCount`+`bedSpaces` required; dining-like [`restaurant`,`lounge`,`bar`] → `seatingCapacity` required), optional embedded `branches: BranchInput[]` created alongside it in the same transaction. Set `ownerId = request.user.id`, `registrationStatus = "Pending"`, generate `uniqueBusinessId`.
**Must return the created record in `data`**, including `id` and `uniqueBusinessId` and any created `branches`.

**`PATCH /establishments/:id`**
Full validation of whatever fields are present. Authorization: allow if `ownerId === request.user.id`, OR if `ownerId === null` (this is the **claim** path — setting `ownerId = request.user.id` as part of this same update). Reject (403) if `ownerId` is set to someone else. Also accepts an updated `branches` array in the body — reconcile it against existing branch rows (create new ones without an `id`, update ones with a matching `id`, leave alone/delete ones removed from the array — your call on delete-vs-leave, but document the choice).
Response `data`: updated record with branches.

**`POST /establishments/bulk`**
Request: `{ entityType, establishments: CreateEstablishmentPayload[] }` — **every item in the batch shares the same `entityType`** (validate this server-side too, don't just trust the frontend). Full validation per item, transactional batch insert, each item + its own optional `branches` created, all get `ownerId = request.user.id`, `registrationStatus = "Pending"`.
Response `data`: array of created records.

**`POST /establishments/draft`**
**Loose validation** — realistically only `entityType` needs to be present and valid; everything else optional/nullable. Create one row, `ownerId = request.user.id`, `registrationStatus = "Draft"`. Do **not** generate `uniqueBusinessId` yet (see section 4 — id generation happens at submit time, once `localGovernment`/`entityType` are final).
Response `data`: the created draft record (its `id` is what the frontend uses for subsequent `updateDraftEstablishment`/`submitDraftEstablishment` calls).

**`PATCH /establishments/draft/:id`**
Loose validation, same as create-draft. Only allowed while `registrationStatus === "Draft"` and `ownerId === request.user.id` — reject (409 or 403) otherwise. Updates in place, stays `Draft`.

**`POST /establishments/draft/:id/submit`**
Runs the **full** validation schema (same as `POST /establishments`) against the merged draft + incoming body. On success: generate `uniqueBusinessId` now, set `registrationStatus = "Pending"`. On validation failure: return 400 with the specific missing/invalid fields (the frontend's own client-side validation should normally prevent this, but the backend must still enforce it, since drafts can be very incomplete).

**`POST /establishments/bulk/draft`**
Request shape identical to `POST /establishments/bulk`. Loose validation per item (only `entityType`, shared across the batch, is required). Creates each item as its **own independent Draft-status row** — this is NOT a single grouped "batch" entity, each becomes individually resumable later via the normal single-establishment draft endpoints.
Response `data`: array of created draft records.

**`POST /establishments/:id/branches`**
Request: `BranchInput` (`{ businessName?, address, localGovernment, businessPhoneNumber, contactName, contactPhoneNumber, contactEmail }`) → creates a new `HospitalityEstablishment` row with `parentEstablishmentId = :id`, inheriting `entityType`/`ownerId` from the parent, `registrationStatus` matching the parent's current status.

**`PATCH /establishments/branches/:branchId`** → partial update of a branch row.

**`DELETE /establishments/branches/:branchId`** → delete the branch row.

#### 6b. `Establishment` response shape (used everywhere above)
```ts
{
  id: string;
  entityType: "hotel" | "restaurant" | "lounge" | "bar" | "tour_operator" | "travel_agent" | "hospitality_org" | "other";
  businessName: string;
  uniqueBusinessId?: string | null;
  businessPhoneNumber: string;
  phoneVerified?: boolean;
  address: string;
  localGovernment: string;
  hasWebsite: boolean;
  website?: string | null;
  yearEstablished: number;
  contactName: string;
  contactPhoneNumber: string;
  contactEmail: string;
  businessEmail: string;
  roomCount?: number | null;
  bedSpaces?: number | null;
  facilities?: string[];
  seatingCapacity?: number | null;
  serviceTypes?: string[];
  registrationStatus: "Draft" | "Pending" | "Approved" | "Rejected";
  rejectionReason?: string | null;
  ownerId?: string | null;
  submittedAt?: string;
  approvedAt?: string | null;
  branches?: Branch[];   // only present on GET /establishments/:id and GET /establishments/mine
}
```
`Branch` shape: same as above minus `branches` itself, plus it's really just another `Establishment` row (has all the same fields) — the frontend's `Branch` type is a narrowed subset (`{id, businessName, address, localGovernment, businessPhoneNumber, contactName, contactPhoneNumber, contactEmail, registrationStatus}`), so it's fine to return the fuller shape, the frontend just reads a subset of it.

### Analytics (`/api/v1/analytics`) — authenticated, owner-scoped

**`GET /analytics/summary`**
Aggregate over `HospitalityEstablishment` where `ownerId = request.user.id` (parent records; decide whether branches count toward totals — recommend yes, count every row including branches, since each branch is its own licensable entity).
Response `data`:
```ts
{
  total: number;
  licensed: number;        // count where registrationStatus === "Approved"
  unlicensed: number;      // count where registrationStatus in ("Pending", "Rejected")
  drafts: number;          // count where registrationStatus === "Draft"
  byEntityType: Record<string, number>;   // e.g. { hotel: 3, restaurant: 2 }
}
```

**`GET /analytics/export?type=all|licensed|unlicensed|drafts&format=xlsx`**
Filter owner's establishments by the `type` param (`all` = no filter, `licensed` = Approved, `unlicensed` = Pending+Rejected, `drafts` = Draft), generate an `.xlsx` file with `exceljs` (columns: business name, type, unique ID, LGA, status, submitted date, branch count, etc — your call on exact columns), stream it back with `Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` and a `Content-Disposition: attachment; filename=...` header. The frontend requests this with `responseType: "blob"` and triggers a browser download — no special response envelope here, just the raw file bytes.

### Admin (`/api/v1/admin`) — see section 2 for the internal `features/` breakdown; the routes below are what actually needs to exist, organize the code among `admin/features/{auth,establishments,analytics}` however fits the pattern in section 1

- `POST /admin/login` — existing behavior, keep.
- `POST /admin/create-admin` — **must be protected**, see section 4.
- `GET /admin/establishments` — list across ALL owners, with query params for filtering by `registrationStatus`/`entityType`/search (extend the existing implementation), should exclude `Draft` status rows (owner-private) from the default view.
- `GET /admin/establishments/:id` — full detail incl. branches and owner info.
- `PATCH /admin/establishments/:id/approve` — sets `Approved`, `approvedAt`, `approvedBy` (see section 4).
- `PATCH /admin/establishments/:id/reject` — sets `Rejected`, requires `rejectionReason` in body (see section 4).
- `PATCH /admin/establishments/:id` — generic field correction by an admin.
- `POST /admin/bulk-add-establishments` — existing behavior (admin seeding unowned establishments, `ownerId: null`), reuse the SAME consolidated Joi schema from section 4 rather than its own divergent one.
- `GET /admin/establishments/analytics-data` — cross-owner analytics (existing behavior, port into the new structure), separate from the owner-scoped `/analytics/summary` endpoint.

## 7. Environment variables

Keep all currently-used ones (`APP_SECRET`, `PORT` vars, `NEON_DB_URL` vars, `SENDGRID_API_KEY`, Redis URL vars, `TERMI_*` if you keep SMS dormant, `LUMIID_*`). Add none beyond what's already present — `express-rate-limit` and `exceljs` need no new env config. **Create a `.env.example`** listing every variable name with a placeholder/empty value (no real secrets), since none currently exists. Do not commit real `.env` values anywhere in your work.

## 8. Verification

After implementing, verify by:
1. `npm run compile` (or equivalent) — must type-check clean.
2. Boot the server (`npm run dev`), confirm `database.sync()` succeeds against the existing Neon Postgres instance without errors (relaxing `allowNull` on existing columns should be a non-destructive `ALTER`; adding new columns/tables likewise — `sync()` without `force`/`alter` won't retrofit existing tables' constraints, so you likely need `sync({ alter: true })` in development for this pass, or hand-write the equivalent `ALTER TABLE` statements — your call, just make sure the running schema actually matches the new model definitions afterward).
3. Manually exercise, at minimum: NIN lookup → register → verify-email-otp → login (password) → login (OTP) → create establishment → bulk create → save/continue/submit a draft → search/claim an unclaimed establishment → add a branch → analytics summary → analytics export → admin login → admin list/approve/reject.
4. Confirm every response envelope matches section 6 exactly (`data` key on success, `message` string on error) — the frontend's `httpClient` and `ApiError` parsing depend on this shape precisely.
