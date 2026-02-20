# Scaling Guide – TaskFlow

## Current Architecture

```
React SPA ──── Axios ──── Express API ──── MySQL DB
```

Single server, single database, JWT in localStorage.

---

## Short-Term Scaling (1K–10K users)

### 1. Database
- **Managed MySQL** – Move from local MySQL to AWS RDS / Google Cloud SQL for managed replication, backups, and auto-scaling
- **Indexes** – Already added on `{ UserId, createdAt }` and `{ UserId, status }` for fast queries
- **Connection Pooling** – Sequelize uses connection pools by default; tune `pool.max` in the config

### 2. Backend
- **PM2** – Run Express with PM2 cluster mode to use all CPU cores:
  ```bash
  pm2 start src/app.js -i max
  ```
- **Rate Limiting** – Add `express-rate-limit` on auth routes to prevent brute-force
- **Helmet.js** – Add security headers
- **Redis Sessions** – Move JWT blacklisting / refresh tokens to Redis

### 3. JWT Refresh Tokens
- Issue short-lived access tokens (15 min) + long-lived refresh tokens stored in HTTP-only cookies
- Add `POST /api/auth/refresh` endpoint

---

## Medium-Term Scaling (10K–100K users)

### 1. Horizontal Backend Scaling
- Deploy multiple Express instances behind **Nginx** reverse proxy or **AWS ALB**
- Stateless JWT auth already supports this (no server-side session)
- Session/cache layer via **Redis** for token blacklisting

### 2. Frontend Optimization
- **Code Splitting** – React.lazy() + Suspense per route (add to App.jsx)
- **CDN** – Deploy static React build to CDN (Cloudflare, AWS CloudFront)
- **React Query / TanStack Query** – Replace manual useEffect fetching with caching, background refetch, and stale-while-revalidate

### 3. CI/CD Pipeline
```
GitHub Push → GitHub Actions → Build + Test → Deploy to AWS/GCP/Render
```

---

## Long-Term Scaling (100K+ users)

### 1. Microservices
Split into separate services:
- `auth-service` – handles register/login/JWT
- `task-service` – handles task CRUD
- `user-service` – handles profiles
- API Gateway (Kong / AWS API Gateway) routes requests

### 2. Message Queue
- Use **BullMQ** (Redis) or **RabbitMQ** for async operations (email notifications, background jobs)

### 3. Database Sharding & Replicas
- MySQL supports read replicas for heavy read workloads
- Implement sharding or partitioning by `UserId` for horizontal data scaling

### 4. Observability
- **Logging** – Winston + centralized logging (Datadog / AWS CloudWatch)
- **Metrics** – Prometheus + Grafana dashboards
- **Tracing** – OpenTelemetry for distributed tracing

---

## Frontend-Backend Integration for Production

```
User → CDN (React build)
     → API Gateway / Load Balancer
     → Express cluster (N nodes)
     → MySQL Primary (Writes) + Replicas (Reads)
               └─ Redis (cache / sessions)
```

### Environment Variables for Production
```
# Backend
DB_HOST=rds-cluster.eu-west-1.rds.amazonaws.com
DB_USER=admin
DB_PASS=supersecret
DB_NAME=webappdb
JWT_SECRET=<256-bit-random-secret>
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=<256-bit-random-secret>
FRONTEND_URL=https://yourdomain.com
NODE_ENV=production

# Frontend (.env.production)
VITE_API_URL=https://api.yourdomain.com/api
```

### Security Checklist for Production
- [ ] Change JWT_SECRET to cryptographically secure random string
- [ ] Use HTTPS everywhere (Let's Encrypt / ACM)
- [ ] Move to HTTP-only cookies for refresh tokens
- [ ] Enable MySQL SSL connections and IP whitelisting
- [ ] Add rate limiting on all auth endpoints
- [ ] Set `NODE_ENV=production` for Express optimizations
- [ ] Enable `helmet()` for HTTP security headers
- [ ] Configure CORS to exact production domain only
