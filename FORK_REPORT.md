# Fork Report: digimos

**Source:** D:/digimos
**Target:** C:/Users/send2/opensource-staging/digimos
**Date:** 2026-06-05
**License:** MIT

---

## Files Copied

81 files committed across all source directories (src/, static/, mockup/, config files).

### Excluded from copy (never transferred)

| Path / Pattern | Reason |
|----------------|--------|
| `.git/` | Private git history |
| `node_modules/` | Generated, reinstallable |
| `.svelte-kit/` | Generated build cache |
| `build/` | Compiled output |
| `database.db`, `database.db-shm`, `database.db-wal` | Live database with user data |
| `.env`, `.env.*` | Contains runtime secrets |
| `.claude/` | IDE session data and internal tool configuration |
| `sessions/` | Runtime session storage |
| `*.map` | Source maps |

---

## Files Removed from Staging Copy

These files were copied during rsync but then removed before commit:

| File | Reason |
|------|--------|
| `task.md` | Internal implementation checklist (no public value, references private context) |
| `mockup/uploads/WhatsApp Image 2026-06-03 at 11.42.14.jpeg` | Personal photo (personal data) |
| `mockup/Prediksi OSN Mtk SMP.pdf` | Unrelated personal document |
| `mockup/digimos.zip` | Binary artifact (duplicate of source, no value in repo) |

---

## Secrets Extracted to .env.example

No hardcoded secrets were found in source files. The project already followed
environment-variable-first configuration throughout. The `.env.example` was generated
from all `process.env.*` references found across the codebase:

| Variable | Source file | Purpose |
|----------|-------------|---------|
| `DATABASE_PATH` | `src/lib/server/db.ts` | Path to SQLite database file |
| `SEED_PASSWORD` | `src/lib/server/seed.ts` | Initial superadmin password at seed time |
| `NODE_ENV` | `src/lib/server/auth.ts` | Controls secure cookie flag |

---

## Internal References Replaced

| Original | Replacement | Location | Occurrences |
|----------|-------------|----------|-------------|
| `36.93.145.149` (private IP) | `your-server-ip` | `implementation_plan.md` | 1 |
| `admin` / `digimos2026` (hardcoded example credentials) | `admin` / `(set via SEED_PASSWORD env var)` | `implementation_plan.md` | 1 |

### Source code review (no changes needed)

All source files in `src/` were inspected. No private IPs, personal email addresses,
internal hostnames, or hardcoded credentials were found. Public API URLs
(`api.myquran.com`, `api.aladhan.com`) are legitimate external services and were
left unchanged.

---

## Files Added / Modified for Open-Source Release

| File | Action | Notes |
|------|--------|-------|
| `README.md` | Replaced | Original was SvelteKit scaffold boilerplate; replaced with full project documentation |
| `LICENSE` | Created | MIT license |
| `.env.example` | Created | Generated from all `process.env.*` references in codebase |
| `package.json` | Modified | Removed `"private": true`; added `"license": "MIT"` |
| `implementation_plan.md` | Modified | Replaced private IP and hardcoded password example |

---

## Warnings / Manual Review Items

- [ ] **`mockup/` directory included**: The `mockup/` folder contains HTML prototypes,
  screenshot scraps, and design reference images. These are benign but add bulk (~15 MB
  in images). Consider removing `mockup/` entirely if a clean minimal release is preferred.

- [ ] **`static/uploads/4/de96b7e9e3c4959e.webp`**: One user-uploaded wallpaper from
  the live instance is included in `static/uploads/`. This appears to be a test/default
  image. Verify it does not contain identifiable content before publishing.

- [ ] **`package-lock.json` included**: The lockfile pins exact dependency versions from
  the development environment. This is fine for reproducibility but ties the project to
  a specific Node.js version. Consider regenerating it after the first clean `npm install`.

- [ ] **Seed data contains mosque-specific defaults**: `src/lib/server/seed.ts` seeds a
  sample mosque named "Masjid Nurul Himmah" in Depok. This is example data, not a secret,
  and is appropriate for an open-source seed script. Users will customise it when deploying.

---

## Next Step

Run `opensource-sanitizer` to verify sanitization is complete before publishing.
