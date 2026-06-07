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

## Production deploy (DigitalOcean App Platform)

1. GitHub repo: **`Ali-oss-cell/piza-front`** (this folder only, not the monorepo root).
2. In App Platform → **Create App** → connect repo.
3. Set **Source directory** to `/` (repo root).
4. App Platform detects Next.js, or use `.do/app.yaml`.
5. **Environment variables** (build + run):

   | Key | Value |
   |-----|--------|
   | `NEXT_PUBLIC_API_URL` | `https://api.marinapizzas.com.au/api` |

6. **Custom domains**: `marinapizzas.com.au`, `www.marinapizzas.com.au`
7. Update DNS (DigitalOcean Networking):

   | Record | Target |
   |--------|--------|
   | `CNAME` `www` | Your new `*.ondigitalocean.app` hostname |
   | `@` apex | App Platform apex instructions |

8. Delete or stop the old App Platform app (`happypizza-l2yks…`) after the new site works.

See `.env.production.example` and `.do/app.yaml`.

## Repo layout

This repo contains **frontend only**. Do not add the NestJS backend here.
