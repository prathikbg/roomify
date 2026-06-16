# Roomify AI - Hostinger Deployment Guide

## Pre-Deployment Checklist

### 1. Environment Variables (.env)

Before pushing to GitHub, confirm your `.env` is configured:

- [ ] `AI_PROVIDER` set to one of: `cloudflare` | `gemini` | `pollinations` | `leonardo`
- [ ] Matching API key set for that provider (see `.env.example`)
- [ ] `AFFILIATE_TAG` set to your Amazon Associates tracking ID
- [ ] `DATABASE_URL` points to your MySQL instance
- [ ] `.env` is in `.gitignore` (verify with `git check-ignore .env`)
- [ ] `.env.example` committed as a template (no real secrets inside)

### 2. What Gets Committed to Git

```
/Source Code/        (src/, api/, db/, contracts/)
Public Assets/       (public/images/, public/videos/)
Config Files/        (package.json, tsconfig*, vite.config.ts, drizzle.config.ts)
.env.example/        (template - NO REAL KEYS)
README.md/
HOSTINGER_DEPLOY.md/ (this file)
```

### 3. What DOESN'T Get Committed

```
.env/                (contains real API keys)
node_modules/
dist/
*.log
```

## Hostinger Setup Steps

### Step 1: Push to GitHub

```bash
cd /path/to/your/project

# Initialize git (if not already)
git init
git add .
git commit -m "Roomify AI - Initial commit"

# Create new GitHub repo and push
git remote add origin https://github.com/YOUR_USERNAME/roomify-ai.git
git branch -M main
git push -u origin main
```

### Step 2: Hostinger VPS Setup

1. Log into **Hostinger** → **VPS** or **Cloud Hosting**
2. Choose **Node.js** support plan
3. Set up **Ubuntu** server (22.04 LTS recommended)

### Step 3: Server Setup Commands

SSH into your server and run:

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20+
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Install MySQL
sudo apt install -y mysql-server
sudo mysql_secure_installation

# Clone your repo
git clone https://github.com/YOUR_USERNAME/roomify-ai.git
cd roomify-ai

# Install dependencies
npm install

# Create .env from example
cp .env.example .env
nano .env  # Edit with your real keys
```

### Step 4: Configure Environment Variables

Edit `.env` on the server:

```env
# --- Database ---
DATABASE_URL=mysql://your_mysql_user:your_password@localhost:3306/roomify

# --- AI (pick ONE provider, set its key) ---
AI_PROVIDER=cloudflare
CLOUDFLARE_ACCOUNT_ID=<your-cloudflare-account-id>
CLOUDFLARE_API_TOKEN=<your-cloudflare-workers-ai-token>

# Alternatives:
# AI_PROVIDER=gemini
# GEMINI_API_KEY=<your-gemini-key>
# AI_PROVIDER=leonardo
# LEONARDO_API_KEY=<your-leonardo-key>
# AI_PROVIDER=pollinations    # no key required

# --- Affiliate ---
AFFILIATE_TAG=<your-amazon-associates-tag>

# --- App ---
NODE_ENV=production
PORT=3000
```

> ⚠️ **Never commit real keys.** Use `.env.example` (placeholders only) as the committed template.

### Step 5: Database Setup

```bash
# Create database
sudo mysql -u root -p
CREATE DATABASE roomify CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'roomify_user'@'localhost' IDENTIFIED BY 'your_strong_password';
GRANT ALL PRIVILEGES ON roomify.* TO 'roomify_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# Update DATABASE_URL in .env
# Then push schema
npm run db:push

# Seed with initial data
npx tsx db/seed.ts
```

### Step 6: Build & Start

```bash
# Build frontend + backend
npm run build

# Start with PM2 (keeps running after SSH disconnect)
pm2 start dist/index.js --name "roomify"

# Auto-start on server reboot
pm2 startup
pm2 save

# Check status
pm2 status
pm2 logs roomify
```

### Step 7: Nginx Reverse Proxy (Recommended)

```bash
sudo apt install -y nginx

# Create config
sudo nano /etc/nginx/sites-available/roomify
```

Add this:
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Increase max body size for image uploads
    client_max_body_size 50M;
}
```

Enable:
```bash
sudo ln -s /etc/nginx/sites-available/roomify /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Step 8: SSL (HTTPS) with Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renew
sudo systemctl enable certbot.timer
```

## PM2 Management Commands

```bash
pm2 status              # Check app status
pm2 logs roomify        # View logs
pm2 logs roomify --lines 100
pm2 restart roomify     # Restart app
pm2 reload roomify      # Zero-downtime reload
pm2 stop roomify        # Stop app
pm2 delete roomify      # Remove from PM2
```

## Updating After Deployment

```bash
cd ~/roomify-ai
git pull origin main
npm install
npm run build
pm2 restart roomify
```

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `PORT 3000 already in use` | `lsof -ti:3000 \| xargs kill -9` |
| `Database connection refused` | Check MySQL is running: `sudo systemctl status mysql` |
| `npm run build fails` | Delete `dist/` and `node_modules/`, run `npm install`, retry |
| `AI provider 401/403 error` | Check the matching `*_API_KEY` / `*_API_TOKEN` in `.env` for the active `AI_PROVIDER` |
| `429 Too many requests from this IP` | Rate limit hit (10 generations/IP/hour by default). Tune in `api/lib/rate-limit.ts` |
| `Gallery shows 0 items` | Run `npx tsx db/seed.ts` to seed database |
| `Static files not loading` | Check `dist/public/` exists after build |
