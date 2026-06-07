# Marina Pizzas — Web (Next.js)

Customer storefront + admin dashboard for **marinapizzas.com.au**.

Backend API lives in a **separate repo**: [`piza-api`](https://github.com/Ali-oss-cell/piza-api).

## Local development

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open http://localhost:3000 — API default: `http://localhost:3001/api`

## Production deploy (DigitalOcean Droplet)

The frontend runs on the **same Droplet as the API**, behind **Traefik**. Deploy is orchestrated from the `piza-api` repo — clone both repos as siblings:

```bash
mkdir -p ~/piza && cd ~/piza
git clone git@github.com:Ali-oss-cell/piza-api.git
git clone git@github.com:Ali-oss-cell/piza-front.git

cd piza-api
cp .env.production.example .env
# Edit .env — ACME_EMAIL, DATABASE_URL, JWT_SECRET, admin password, etc.
# First deploy only: RUN_SEED=true, then set RUN_SEED=false

docker compose -f docker-compose.prod.yml up -d --build
```

Traefik terminates HTTPS and routes:

| Host | Container |
|------|-----------|
| `marinapizzas.com.au`, `www.marinapizzas.com.au` | `piza-front` (this repo) |
| `api.marinapizzas.com.au` | `piza-api` |

### DNS (DigitalOcean Networking)

Point all records to the **same Droplet IP**:

| Record | Type | Value |
|--------|------|--------|
| `@` | A | Droplet IP |
| `www` | A or CNAME | Droplet IP / apex |
| `api` | A | Droplet IP |

Let's Encrypt certificates are issued automatically on first request (ports 80 and 443 must be open).

### Rebuild frontend only

After pushing frontend changes:

```bash
cd ~/piza/piza-api
docker compose -f docker-compose.prod.yml up -d --build web
```

### Docker build (this repo)

`NEXT_PUBLIC_API_URL` is baked in at **build time**:

```bash
docker build \
  --build-arg NEXT_PUBLIC_API_URL=https://api.marinapizzas.com.au/api \
  -t piza-front .
```

See `.env.production.example`.

## Repo layout

This repo contains **frontend only**. Do not add the NestJS backend here.
