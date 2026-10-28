# Privacy and Safety Notes

AtmosWatch is an educational preparedness tool. It is not an official emergency dispatch, alerting, or campus certification system. Follow local authorities and institution-approved emergency plans.

## Data handled

- Account registration stores name, email, hashed password, learner level, role, and optional institution reference.
- Learning progress and quiz scores are account-linked. Simulation attempts are account-linked.
- Institution checklists and drills are scoped to the authenticated institution; `ADMIN` and `INSTRUCTOR` may write, while `STUDENT` records remain personal.
- Managed accounts are inactive until a hashed, single-use activation token is redeemed. Admin role/status/institution changes invalidate prior sessions and emit audit events.
- Weather search location is sent to Open-Meteo geocoding and forecast services. Browser geolocation is not requested or collected.
- Public provider requests are made by the API and normalized before being returned to the browser.

## Safeguards and limits

Passwords are hashed with bcryptjs. Session tokens are stored in HttpOnly, SameSite=Strict cookies. The web client does not store passwords or session tokens in localStorage. Instructor scope comes from the authenticated database user; client-supplied institution IDs are not trusted. JSON bodies are validated, sensitive auth routes are rate-limited, and errors avoid returning stack traces.

Before production use, operators must define account deletion, retention periods, consent/notice, access reviews, database backup and breach processes, and jurisdiction-specific review for minors. This project does not claim compliance with any law. Do not add student attendance names, exact student locations, medical details, or campus security-sensitive points unless a reviewed institutional purpose and access policy exists.
