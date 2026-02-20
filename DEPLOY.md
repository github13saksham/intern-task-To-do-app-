# Production Build & Deployment Guide

## 1. Local Monolith (Easiest)

I have configured the backend to serve the frontend as static files when `NODE_ENV=production`. This allows you to run the entire app from a single server.

### Build Steps:
1.  **Build Frontend:**
    ```bash
    cd frontend
    npm install
    npm run build
    ```
2.  **Start Backend:**
    ```bash
    cd ../backend
    npm install
    # Set NODE_ENV to production in your .env or shell
    # On Windows (PowerShell): $env:NODE_ENV="production"; node src/app.js
    ```
    The app will now be available at `http://localhost:5000`.

---

## 2. Deploy to Render (Recommended Free Tier)

Render is great for full-stack apps. You will need two "Web Services": one for MD and one for Express.

### A. Database (MySQL)
1.  On [Render](https://render.com/), create a new **PostgreSQL** (standard practice on Render) or use an external MySQL provider like **Aiven** or **Railway**.
2.  Get your Connection String.

### B. Backend (Web Service)
1.  Connect your GitHub repo.
2.  **Root Directory:** `backend`
3.  **Build Command:** `npm install`
4.  **Start Command:** `npm start`
5.  **Environment Variables:**
    - `DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME` (from your provider)
    - `JWT_SECRET` (a long random string)
    - `NODE_ENV=production`

### C. Frontend (Static Site)
1.  Connect your GitHub repo.
2.  **Root Directory:** `frontend`
3.  **Build Command:** `npm run build`
4.  **Publish Directory:** `dist`
5.  **Environment Variables:**
    - `VITE_API_URL=https://your-backend-url.onrender.com/api`

---

## 3. Deployment with Docker (Pro Way)

You can use the provided `docker-compose.yml` to spin up the entire production stack locally or on any VPS (AWS, DigitalOcean).

Run:
```bash
docker-compose up --build
```

---

## 4. Scaling Integration Strategy (For Assignment)

To scale this for actual production:
1.  **Frontend:** Deploy the `frontend/dist` folder to a CDN (Cloudflare Pages or AWS S3 + CloudFront) for global speed.
2.  **Backend:** Use a Load Balancer (AWS ALB / Nginx) to distribute traffic across multiple instances of the Express server.
3.  **Database:** Use a managed service like AWS RDS (MySQL) with "Multi-AZ" enabled for high availability and automated backups.
4.  **Security:** Always use HTTPS. Use `helmet` for security headers and `express-rate-limit` to prevent API abuse.
