# WebGuard — Website Quality Analyzer
Full-stack Lighthouse auditing platform: React + Vite + Tailwind + Recharts, Express, MongoDB.

## Run
Requires Node 18.20+, MongoDB, and Chrome/Chromium installed.
```bash
cd server && cp .env.example .env && npm install && npm run dev   # http://localhost:4000
cd client && npm install && npm run dev                            # http://localhost:5173
```
## API
POST /api/scans {url} · GET /api/scans · GET /api/scans/:id · DELETE /api/scans/:id · GET /api/websites
Audits run one at a time in an in-process queue. Private/internal addresses are rejected (SSRF guard).
