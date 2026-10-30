# Mentor application workflow verification

The workflow fix covers both repositories. The frontend builds on authentication PR #10 and requires the backend workflow endpoint changes.

## Failures corrected

- Mentor registration now checks name, email and password limits before starting OTP verification. Duplicate submissions are locked synchronously, and an account-created response lost in transit can recover through sign-in.
- Provider-created database rows are synchronized to the mentor role before the signup response is returned. A previously created Supabase account can be recovered only by authenticating its existing password.
- Existing-account email confirmation uses a dedicated endpoint instead of trying to register the account again. It issues no session and changes no password or role; normal sign-in, CAPTCHA and two-factor checks still apply.
- Callback session tokens are validated before replacing existing local credentials. Explicit authorization headers are preserved, and failed callback verification cannot refresh into a previous account.
- Onboarding loading uses the server status rather than cached completion metadata. Mentor intent survives retries and uppercase intent values; loading requests and answer submissions reject stale responses.
- Manual answers enforce identity limits, retain input on errors and reject rapid duplicate submissions. Returning applicants resume their saved question; incomplete applicants can use Later and view application status.
- LinkedIn imports recover from cancellation, missing profiles and malformed AI data. Imported facts stay editable, partial edits survive refresh in a browser draft scoped to the account, and a session refresh cannot reset the submitted screen.
- LinkedIn callbacks use the configured frontend origin and server-configured provider callback. Publication retries are idempotent, with bounded retries for serializable database conflicts, and preserve admin approval decisions.
- Legacy completed mentor profiles do not restart the interview. Status checks have retry controls; mobile preferences wrap without horizontal overflow.

## Verification

- Frontend: `npm run test:mentor-workflow` — 76 passing tests, including the existing authentication and matching-keyboard tests.
- Backend: `npm run test:onboarding` — 49 passing tests, including complete NEET, JEE, law and career interviews.
- Frontend: `npm run build -- --webpack` and TypeScript checking.
- Backend: Prisma client generation and schema validation with nonconnecting placeholder URLs; no migration or live database write was run.
- Browser: the real manual interview and LinkedIn review components against the real onboarding service/controllers with an isolated in-memory fixture. Verified validation, refresh/resume, edited-draft persistence, final submission, and a 390px viewport without horizontal overflow.

The browser fixture, synthetic accounts and temporary servers are not included in the application or production build. Actual Google/LinkedIn provider consent and delivery to a real email inbox were not automated; those depend on production provider configuration. No real user credentials or account data were used.
