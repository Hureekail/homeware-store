# Django + React E‑commerce

A full‑stack e‑commerce example built with Django REST Framework, Djoser + JWT auth, React (Vite), Redux Toolkit, TailwindCSS, Nginx, and Docker. Includes Google OAuth, email flows, media/static handling, and CI/CD via GitLab.

---

## Overview

- Backend: Django 5.1.4, DRF, Djoser (JWT), social-auth (Google), Redis for cache, PostgreSQL.
- Frontend: React 18 (Vite), Redux Toolkit, TailwindCSS, Framer-Motion.
- Reverse proxy: Nginx serving static/media and built frontend, routing API to backend.
- Containerization: Docker, `docker-compose` for multi-service orchestration.
- CI/CD: GitLab pipeline builds, tests, and deploys via Docker Compose.

## Project Structure

```
Django-React-ecommerce-Recape/
  backend/
    backend/
      settings.py        # Env-driven Django settings
      urls.py            # API routes wiring and SPA catch-all
      asgi.py, wsgi.py
    accounts/            # Custom user + auth endpoints
      models.py
      serializers.py
      urls.py
      views.py
    products/            # Product catalog + orders
      models.py
      serializers.py
      urls.py
      views.py
    media/               # Uploaded media
    staticfiles/         # Collected static (for production)
    Dockerfile
    entrypoint.prod.sh
    manage.py
  frontend/
    src/                 # React app source
      components/
      pages/
      reducers/
      store.js
      api.jsx
      App.jsx, main.jsx
    public/
    dist/                # Vite build output (CI/local build)
    Dockerfile           # Builds static site served by Nginx
    vite.config.js
    package.json
  nginx/
    nginx-setup.conf     # Reverse proxy and static/media config
  docker-compose.yml      # Backend, frontend builder, and Nginx
  .gitlab-ci.yml          # CI pipeline: build, test, deploy
  README.md
```

## Prerequisites

- Docker and Docker Compose
- For local (non-Docker) dev: Python 3.13 with venv, Node.js 18+, PostgreSQL, Redis

## Environment Variables

Create `backend/.env.prod` for Docker Compose deploy and `.env.local` for local development. Keys used in `backend/backend/settings.py`:

Required (backend):
- DJANGO_SECRET_KEY
- DEBUG (0 or 1)
- DJANGO_ALLOWED_HOSTS (comma-separated, e.g. `localhost,127.0.0.1`)
- DJANGO_CSRF_TRUSTED_ORIGINS (comma-separated URLs)
- DJANGO_CORS_ALLOWED_ORIGINS (comma-separated URLs)
- FRONTEND_DOMAIN (e.g. `example.com`)
- FRONTEND_SITE_NAME (optional, default `Recape`)
- DJANGO_SOCIAL_AUTH_ALLOWED_REDIRECT_URIS (comma-separated redirect URIs; first is used as GOOGLE redirect)
- DJANGO_SOCIAL_AUTH_ALLOWED_REDIRECT_HOSTS (comma-separated hosts)
- LOCAL_SOCIAL_AUTH_GOOGLE_OAUTH2_KEY
- LOCAL_SOCIAL_AUTH_GOOGLE_OAUTH2_SECRET
- REDIS_URL (e.g. `redis://:password@host:6379/0`)
- DB_NAME, DB_USER, DB_PASSWORD, DB_HOST
- LOCAL_EMAIL_HOST_USER, LOCAL_EMAIL_HOST_PASSWORD

Frontend: typically configure base API URL inside `frontend/src/api.jsx` or via Vite env vars if desired.

## Quick Start (Docker)

1) Build and run
```bash
docker compose up -d --build
```

2) Apply migrations and create superuser (first run)
```bash
docker compose exec backend python manage.py migrate
docker compose exec backend python manage.py createsuperuser
```

3) Collect static (if needed)
```bash
docker compose exec backend python manage.py collectstatic --noinput
```

- Backend: http://localhost:8000 (proxied by Nginx)
- Nginx (frontend + proxy): http://localhost:80
- Django admin: http://localhost:80/admin/

## Local Development (without Docker)

Backend
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r backend/requirements.txt
cd backend
# create and fill values in .env.local if needed
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

Frontend
```bash
cd frontend
npm install
npm run dev
```

## API Endpoints

Auth (Djoser + JWT)
- POST `/api/auth/jwt/create/` – obtain access/refresh
- POST `/api/auth/jwt/refresh/`
- Djoser core routes under `/api/auth/` (password reset, activation, social, etc.)
- Custom:
  - GET `/api/auth/csrf/` – fetch CSRF token

Accounts
- DELETE `/api/accounts/delete-profile/`
- PATCH `/api/accounts/update-name/`
- PATCH `/api/accounts/change-email/`
- GET `/api/accounts/verify-email/{uidb64}/{token}/`
- POST `/api/accounts/contact/`

Products
- GET `/api/products/`
- GET `/api/categories/`
- POST `/api/orders/`

Tokens
- POST `/api/token/` – obtain JWT pair (DRF SimpleJWT)
- POST `/api/token/refresh/`

Note: In production, Nginx serves the SPA and proxies `/api/*` to Django.

## Frontend

- Dev: `npm run dev`
- Build: `npm run build` → outputs to `frontend/dist/`
- The Dockerfile builds the React app and provides built assets to Nginx via a named volume (`react_build`).

## Deployment

- Nginx configuration `nginx/nginx-setup.conf` mounts:
  - `/var/www/frontend` (built React)
  - `/var/www/static` (Django static)
  - `/var/www/media` (Django media)
- `docker-compose.yml` services:
  - backend: Django app on 8000, volume `./static:/app/staticfiles`
  - frontend: builds the React app, writes to `react_build` volume
  - nginx: serves frontend on 80, proxies API to backend

### Gunicorn and workers

The backend container starts Django using Gunicorn via `backend/entrypoint.prod.sh`:

```bash
python3 -m gunicorn --bind 0.0.0.0:8000 --workers 3 backend.wsgi:application
```

- Current setting: 3 worker processes.
- Tuning rule of thumb: workers = 2 * CPU_cores + 1 (e.g., 2 cores → 5 workers).
- To change workers (and other options like `--timeout`, `--threads`, `--preload`), edit `backend/entrypoint.prod.sh`.

## CI/CD (GitLab)

`.gitlab-ci.yml` stages:
- build: Docker build backend and frontend images
- test: run Django tests inside backend image
- deploy: `docker compose up -d`

Adjust registry pushes, secrets, and deployment runner as needed for your environment.

---

### Infrastructure & Hosting

This project uses AWS RDS for PostgreSQL, Railway for Redis, AWS EC2 for hosting the services, and rootless Docker to run CI/CD deployment pipelines on the instance.
