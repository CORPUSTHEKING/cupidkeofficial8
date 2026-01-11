
# CupidKE

CupidKE is an in-progress dating platform built with a backend-first approach, emphasizing explicit database design, deterministic migrations, and transparent system behavior.

---

## Status

Active development.

Core backend infrastructure is operational:
- PostgreSQL schema and migrations
- Migration ledger
- Seeded development data
- Running Node.js server

---

## Tech Stack

**Backend**
- Node.js
- Express
- PostgreSQL
- `pg` (raw SQL, no ORM)

**Environment**
- Termux
- PostgreSQL (local)
- GitLab (primary)
- GitHub (secondary mirror)

---

## Project Principles

- No ORMs
- Explicit SQL and schema ownership
- Deterministic, replayable migrations
- No error suppression
- Backend-driven architecture

---

## Directory Structure

```text
server/
├── index.js
├── db.js
└── db/
    ├── migrate.js
    ├── seed.js
    └── migrations/
        ├── 000_init_migrations.sql
        ├── 001_init.sql
        ├── 001_init_schema.sql
        └── 002_users_email_unique.sql
````

---

## Database

### Run migrations

```sh
PGHOST=127.0.0.1 \
PGPORT=5432 \
PGDATABASE=cupidke \
PGUSER=u0_a1396 \
node server/db/migrate.js
```

### Seed development data

```sh
PGHOST=127.0.0.1 \
PGPORT=5432 \
PGDATABASE=cupidke \
PGUSER=u0_a1396 \
node server/db/seed.js
```

---

## Schema Overview

- users
- notifications
- enum_yesno

All constraints and enums are defined via migrations.

---

## Git Policy

- GitLab is primary
- GitHub is secondary
- All schema changes require migrations

---

## Roadmap

- Authentication
- Authorization
- Realtime notifications
- Frontend integration

---

## License

Private project. All rights reserved.