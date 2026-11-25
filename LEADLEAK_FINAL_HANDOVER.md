# LeadLeak Final Handover

## 1. Project architecture

LeadLeak is a two-package JavaScript monorepository.

```text
LeadLeak/
  backend/
    config/          MongoDB connection
    constants/       Alert retry configuration
    controllers/     Express request handlers
    middleware/      JWT authentication and Zod request validation
    models/          Mongoose schemas
    routes/          Express route mounting
    scripts/         Manual diagnostic scripts
    services/        Monitoring, SSL, browser, analytics, and email services
    test-pages/      Controlled contact-form fixture
    tests/           Node test runner suites
    utils/           Validation and secure networking helpers
  frontend/
    src/
      components/    Shared layout and UI components
      pages/         Authentication, workspace, website, analytics, and alert pages
      routes/        React Router configuration
```

The backend is ES-module Node.js with Express 5. The frontend is React 19 with Vite. MongoDB is used through Mongoose.

## 2. Technology stack

- Node.js ES modules
- Express 5
- Mongoose/MongoDB
- JWT authentication
- Zod
- Node.js built-in HTTP/HTTPS/TLS networking
- node-cron
- Nodemailer
- Playwright Chromium
- React 19
- React Router
- Vite
- Tailwind CSS

## 3. Main API routes

| Route prefix | Purpose |
|---|---|
| `/api/auth` | Registration and login |
| `/api/users` | Current user |
| `/api/organizations` | Workspace management |
| `/api/websites` | Website CRUD and monitoring toggle |
| `/api/verification` | Ownership verification |
| `/api/monitoring` | Manual checks and monitoring history |
| `/api/analytics` | Uptime analytics |
| `/api/alerts` | Organization alert history |
| `/api/contact-form-monitors` | Contact-form monitor CRUD and manual tests |
| `/api/health` | Server health response |

Important website routes include `GET /api/websites/organization/:organizationId`, `PATCH /api/websites/:id`, `DELETE /api/websites/:id`, and `PATCH /api/websites/:id/monitoring`.

Important monitoring routes are `POST /api/monitoring/:id/check` and `GET /api/monitoring/:id/history`.

Contact-form listing routes are both:

- `GET /api/contact-form-monitors/organization/:organizationId`
- `GET /api/contact-form-monitors/:organizationId`

Both routes are intentionally mounted for frontend and compatibility use.

## 4. Authentication and permissions

JWTs are read from the `Authorization: Bearer <token>` header. The auth middleware verifies the signature and finds an active user. Missing, invalid, and expired tokens receive HTTP 401.

Organization access is checked through active `Membership` records. The organization, website, monitoring, analytics, alert, and contact-form handlers generally require active membership. Website updates, monitoring configuration, and website deletion require owner or admin membership where implemented. Workspace updates and deletion require owner membership.

Archived websites and contact-form monitors are excluded from normal listings and retrieval.

## 5. Website monitoring flow

1. A website is created and validated.
2. Ownership verification is started and completed through verification routes.
3. Monitoring is enabled only after verification.
4. Manual or scheduled monitoring checks the configured monitoring URL.
5. HTTP availability, response time, HTTP status, and SSL status are recorded in `MonitoringCheck`.
6. The service requires consecutive failures before a website is confirmed down.
7. Recovery is confirmed immediately on a successful check.
8. Monitoring status changes create downtime or recovery alerts.

The scheduler runs every five minutes and processes pending email retries before selecting verified, monitoring-enabled, non-archived websites.

## 6. SSL monitoring flow

The SSL service resolves and pins a public destination, opens a TLS connection with certificate validation, reads `valid_to`, and returns `valid`, `invalid`, or `unknown`. HTTP websites return SSL status `unknown`. Expired, malformed, self-signed, mismatched-chain, and certificate-alt-name errors are represented as invalid or unknown according to the observed Node.js error.

SSL expiry alerts are unique per website and certificate-expiry date.

## 7. Contact-form monitoring flow

The contact-form monitor service validates:

- Organization and website ObjectIds
- Monitor name and form type
- Verified, non-archived website ownership
- HTTP/HTTPS form URL
- Public network destination
- Form hostname matches the monitored website hostname

Manual tests run a Playwright-controlled browser submission. The browser is restricted to the fixed local fixture port `4179` for `testLocalContactForm`. Public form-page inspection also validates the initial URL and redirects before navigating.

Each manual test stores a `ContactFormCheck` and updates the monitor's status, response time, checked time, and error.

Automatic contact-form monitoring is **not implemented**. The current scheduler does not select or test contact-form monitors.

## 8. Scheduler architecture

`startMonitoringScheduler()` creates one node-cron task scheduled every five minutes. A module-level running flag prevents overlapping cycles. Each website check is isolated so one failure does not stop the remaining websites.

The active check set in `websiteMonitoringService` prevents duplicate concurrent checks for the same website.

The scheduler also recovers stuck email deliveries in `sending` status and processes pending retries.

## 9. Email and alert architecture

Alerts are stored in MongoDB. Alert email delivery atomically claims an alert by changing `pending` to `sending`, sends to active organization members, and then changes it to `sent` or schedules it back to `pending`.

Retry limits and delays are defined by `backend/constants/alertConfig.js`.

Stuck `sending` alerts are recovered by the scheduler. A delivery that exceeds the configured attempt limit is marked `failed`.

Automated tests do not send real email. Existing manual email scripts require SMTP configuration and should not be run against customer recipients.

## 10. Database models

| Model | Main relationships |
|---|---|
| `User` | User account |
| `Organization` | Workspace owned by a user |
| `Membership` | Joins users and organizations with role/status |
| `Website` | Belongs to an organization and was added by a user |
| `MonitoringCheck` | Belongs to a website and organization |
| `ContactFormMonitor` | Belongs to an organization and website |
| `ContactFormCheck` | Belongs to a monitor, website, and organization |
| `Alert` | Belongs to an organization and website |

Duplicate websites are prevented per organization by a unique organization/URL index. Monitoring and retry indexes are present for history and scheduler queries. SSL alerts have a unique partial index for a website/type/expiry combination.

## 11. Environment variables

Names only:

- `PORT`
- `NODE_ENV`
- `MONGODB_URI`
- `CLIENT_URL`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `FAILURE_CONFIRMATION_COUNT`
- `DNS_RESOLUTION_TIMEOUT_MS`
- `VITE_API_URL`

Do not commit or report secret values.

## 12. Test setup and commands

Tests use Node 24's built-in `node:test` runner. Playwright Chromium is used for the controlled local contact-form fixture.

Run from `backend/`:

```powershell
npm test
npm run test:unit
npm run test:integration
npm run test:security
npm run test:coverage
```

Run the frontend build from `frontend/`:

```powershell
npm run build
```

The test suite does not connect to MongoDB and does not send SMTP email. It uses isolated units and a loopback-only browser fixture.

## 13. Test results

Current executed results:

- Full backend suite: 12 passed, 0 failed.
- Unit suite: 8 passed, 0 failed.
- Integration suite: 1 passed, 0 failed.
- Security suite: 3 passed, 0 failed.
- Local Playwright form inspection/submission: passed.
- Frontend production build: passed.
- Backend syntax checks: passed.

Not executed:

- Live MongoDB CRUD and transaction tests
- Live authentication API integration tests
- End-to-end scheduler cycles
- SMTP email delivery tests
- Production customer traffic tests

These were blocked to avoid using real credentials or production/customer data.

## 14. Files modified during the stabilization session

- `backend/package.json`
- `backend/config/db.js`
- `backend/server.js`
- `backend/routes/contactFormMonitorRoutes.js`
- `backend/services/contactFormBrowserService.js`
- `backend/tests/unit/authMiddleware.test.js`
- `backend/tests/unit/analytics.test.js`
- `backend/tests/unit/contactFormRoutes.test.js`
- `backend/tests/unit/modelValidation.test.js`
- `backend/tests/integration/contactFormFixture.test.js`
- `backend/tests/security/websiteSecurity.test.js`
- `LEADLEAK_FINAL_HANDOVER.md`

## 15. Security improvements

- The contact-form listing compatibility route was restored.
- Browser form inspection validates public URLs.
- Browser redirects are revalidated before navigation.
- Local contact-form submission is restricted to loopback on the fixed controlled test port.
- MongoDB startup no longer calls process exit inside the database module, allowing callers to handle startup failures.
- The server app is exportable for isolated testing.
- Existing HTTP request logic pins DNS destinations to resolved public addresses and revalidates redirects.
- Existing private, reserved, loopback, link-local, and local-hostname restrictions remain in force.

Browser DNS rebinding is not fully eliminable by application-level route callbacks alone. The HTTP monitoring implementation is stronger because it resolves and pins the destination while preserving Host and TLS server name.

## 16. Known bugs and limitations

- Live database integration is not installed or verified in the test suite.
- Automatic contact-form monitoring is incomplete.
- The frontend has no contact-form monitor UI.
- Mongoose model validation tests originally triggered a `validateSync()` deprecation; tests now use `validate()`.
- Frontend builds emit a bundle-size warning for JavaScript over 500 KB.
- The production CORS origin configuration must include the deployed frontend origin.
- MongoDB startup currently uses public DNS servers for MongoDB SRV lookups.

## 17. Features not implemented

- Scheduled contact-form monitoring
- Contact-form monitor history UI
- Notification preferences
- Down-alert deduplication at the database level for repeated alert types
- Dedicated isolated MongoDB test container or memory database
- Full live API authorization integration suite

## 18. Recommended next priorities

1. Add an isolated test MongoDB URI and live integration suite.
2. Add controller/API tests for JWT, memberships, cross-organization access, and archived resources.
3. Add local HTTP and TLS fixture tests for monitoring and SSL states.
4. Implement the contact-form scheduler only after defining retry and alert semantics.
5. Add database-level down/recovery alert deduplication if concurrent manual and scheduled checks can create duplicates.
6. Add frontend contact-form monitor screens and API calls if intended.
7. Split frontend chunks to resolve the build-size warning.
8. Add a global Express error handler for unexpected routing and server errors.

## 19. Local running instructions

1. Copy `backend/.env.example` to `backend/.env`.
2. Set environment variable names described above without replacing existing credentials.
3. Install dependencies:

```powershell
cd backend
npm install

cd ..\frontend
npm install
```

4. Start from the repository root:

```powershell
npm run dev
```

This starts the frontend and backend concurrently. Do not start against production MongoDB or SMTP credentials for testing.
