# Deployment Guide

Comprehensive deployment guide for the Aluma Trade Services Management Platform across different environments and hosting providers.

## Overview

Aluma is designed for modern deployment practices with support for:

- **Vercel** (Recommended for production)
- **Docker** containers
- **Traditional VPS** hosting
- **Development** environments

## Prerequisites

### System Requirements

- **Node.js**: 18.0 or higher
- **npm/yarn**: Latest stable version
- **PostgreSQL**: 14+ (via Supabase)
- **Git**: For version control

### External Services

- **Supabase Account** - Database and authentication
- **Email Service** (optional) - SendGrid, AWS SES, or similar
- **File Storage** (optional) - Supabase Storage or AWS S3
- **Monitoring** (optional) - Sentry for error tracking

## Environment Configuration

### Environment Variables

Create environment files for each deployment target:

#### `.env.local` (Development)

```env
# Database Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Aluma Development
NODE_ENV=development

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_local_secret

# Optional Services
SENDGRID_API_KEY=your_sendgrid_key
SENTRY_DSN=your_sentry_dsn
```

#### `.env.production` (Production)

```env
# Database Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-prod-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_prod_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_prod_service_role_key

# App Configuration
NEXT_PUBLIC_APP_URL=https://aluma.yourdomain.com
NEXT_PUBLIC_APP_NAME=Aluma
NODE_ENV=production

# Authentication
NEXTAUTH_URL=https://aluma.yourdomain.com
NEXTAUTH_SECRET=your_production_secret_minimum_32_chars

# Production Services
SENDGRID_API_KEY=your_production_sendgrid_key
SENTRY_DSN=your_production_sentry_dsn

# Performance & Security
NEXT_TELEMETRY_DISABLED=1
```

### Security Configuration

```env
# Additional security headers
NEXT_PUBLIC_CSP_NONCE=true
NEXT_PUBLIC_SECURE_COOKIES=true

# API Rate Limiting
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=60000

# File Upload Limits
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=image/jpeg,image/png,application/pdf
```

## Supabase Setup

### 1. Create Supabase Project

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Create new project (optional)
supabase projects create aluma-production
```

### 2. Database Schema Deployment

```sql
-- In Supabase SQL Editor, run in order:

-- 1. Essential schema
\i scripts/mvp-essential-schema.sql

-- 2. Demo data (development only)
\i scripts/mvp-seed-data.sql

-- 3. Enable RLS (production)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
```

### 3. Authentication Setup

```bash
# Configure auth providers in Supabase Dashboard
# - Enable email/password authentication
# - Set up email templates
# - Configure redirect URLs
```

**Supabase Auth Configuration:**

```json
{
  "SITE_URL": "https://aluma.yourdomain.com",
  "ADDITIONAL_REDIRECT_URLS": [
    "http://localhost:3000",
    "https://aluma-staging.yourdomain.com"
  ],
  "JWT_EXPIRY": 3600,
  "DISABLE_SIGNUP": false,
  "EXTERNAL_EMAIL_ENABLED": true,
  "MAILER_SECURE_EMAIL_CHANGE_ENABLED": true
}
```

### 4. Storage Configuration

```sql
-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES
  ('avatars', 'avatars', true),
  ('documents', 'documents', false),
  ('job-photos', 'job-photos', false);

-- Set up storage policies
CREATE POLICY "Users can upload their own avatar" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view job photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'job-photos');
```

## Vercel Deployment (Recommended)

### 1. Vercel CLI Setup

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Link project
vercel link
```

### 2. Project Configuration

Create `vercel.json`:

```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/$1"
    }
  ]
}
```

### 3. Environment Variables Setup

```bash
# Set environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add NEXTAUTH_SECRET production

# Pull environment variables for local development
vercel env pull .env.local
```

### 4. Deployment

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod

# Deploy with specific environment
vercel --target production --env NEXT_PUBLIC_APP_URL=https://aluma.yourdomain.com
```

### 5. Custom Domain Setup

```bash
# Add custom domain
vercel domains add aluma.yourdomain.com

# Verify domain ownership
vercel domains verify aluma.yourdomain.com

# Set up SSL certificate (automatic)
```

## Docker Deployment

### 1. Dockerfile

```dockerfile
# Multi-stage build for production
FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --only=production

FROM node:18-alpine AS builder
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

### 2. Docker Compose

```yaml
# docker-compose.yml
version: "3.8"
services:
  aluma:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - NEXTAUTH_URL=${NEXTAUTH_URL}
    env_file:
      - .env.production
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - aluma
    restart: unless-stopped
```

### 3. Build and Deploy

```bash
# Build the image
docker build -t aluma:latest .

# Run locally
docker run -p 3000:3000 --env-file .env.production aluma:latest

# Deploy with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f aluma
```

### 4. Production Docker Commands

```bash
# Build for production
docker build --target runner -t aluma:prod .

# Tag for registry
docker tag aluma:prod your-registry.com/aluma:latest

# Push to registry
docker push your-registry.com/aluma:latest

# Deploy on server
docker pull your-registry.com/aluma:latest
docker stop aluma-container || true
docker rm aluma-container || true
docker run -d --name aluma-container -p 3000:3000 --env-file .env.production your-registry.com/aluma:latest
```

## Traditional VPS Deployment

### 1. Server Setup (Ubuntu 22.04)

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx -y

# Install SSL certificates (Let's Encrypt)
sudo apt install certbot python3-certbot-nginx -y
```

### 2. Application Deployment

```bash
# Clone repository
git clone https://github.com/your-org/aluma.git
cd aluma

# Install dependencies
npm ci --only=production

# Build application
npm run build

# Create PM2 ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'aluma',
    script: 'npm',
    args: 'start',
    cwd: '/home/ubuntu/aluma',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    env_file: '.env.production',
    log_file: '/var/log/aluma/combined.log',
    out_file: '/var/log/aluma/out.log',
    error_file: '/var/log/aluma/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm Z'
  }]
}
EOF

# Start application with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 3. Nginx Configuration

```nginx
# /etc/nginx/sites-available/aluma
server {
    listen 80;
    server_name aluma.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name aluma.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/aluma.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/aluma.yourdomain.com/privkey.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' https:; frame-src 'none';" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=1r/s;

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
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    location /api/ {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api/auth/ {
        limit_req zone=login burst=5 nodelay;
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static files caching
    location /_next/static/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        proxy_pass http://localhost:3000;
    }

    location /favicon.ico {
        expires 1y;
        add_header Cache-Control "public, immutable";
        proxy_pass http://localhost:3000;
    }
}
```

### 4. SSL Certificate Setup

```bash
# Enable nginx site
sudo ln -s /etc/nginx/sites-available/aluma /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Get SSL certificate
sudo certbot --nginx -d aluma.yourdomain.com

# Setup auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet && systemctl reload nginx
```

## Staging Environment

### 1. Staging Configuration

```bash
# Create staging branch
git checkout -b staging
git push origin staging

# Deploy to staging subdomain
# staging.aluma.yourdomain.com
```

### 2. Staging-Specific Settings

```env
# .env.staging
NEXT_PUBLIC_APP_URL=https://staging.aluma.yourdomain.com
NEXT_PUBLIC_APP_NAME=Aluma Staging
NEXT_PUBLIC_SUPABASE_URL=https://staging-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=staging_anon_key
SUPABASE_SERVICE_ROLE_KEY=staging_service_role_key

# Staging-specific features
NEXT_PUBLIC_ENABLE_DEBUG=true
NEXT_PUBLIC_SHOW_PERFORMANCE_METRICS=true
```

## Monitoring & Health Checks

### 1. Health Check Endpoint

```typescript
// app/api/health/route.ts
export async function GET() {
  try {
    // Check database connection
    const { data, error } = await supabase
      .from("users")
      .select("count")
      .limit(1);

    if (error) throw error;

    return Response.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      services: {
        database: "connected",
        application: "running",
      },
    });
  } catch (error) {
    return Response.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: error.message,
      },
      { status: 500 },
    );
  }
}
```

### 2. PM2 Monitoring

```bash
# Monitor processes
pm2 monit

# View logs
pm2 logs aluma

# Restart application
pm2 restart aluma

# Check status
pm2 status
```

### 3. Server Monitoring

```bash
# Install monitoring tools
sudo apt install htop iotop nethogs

# Check system resources
htop
df -h
free -h

# Monitor nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## Backup & Recovery

### 1. Database Backups

```bash
# Supabase automatic backups
# - Point-in-time recovery
# - Daily snapshots
# - Download backups via CLI

supabase db dump --db-url postgresql://user:pass@host:port/db > backup.sql
```

### 2. Application Backups

```bash
# Create backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/aluma"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup application files
tar -czf $BACKUP_DIR/aluma_app_$DATE.tar.gz /home/ubuntu/aluma

# Backup environment files
cp /home/ubuntu/aluma/.env.production $BACKUP_DIR/env_$DATE.backup

# Cleanup old backups (keep 30 days)
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete
find $BACKUP_DIR -name "*.backup" -mtime +30 -delete

echo "Backup completed: $DATE"
```

### 3. Recovery Procedures

```bash
# Restore application
tar -xzf /backups/aluma/aluma_app_YYYYMMDD_HHMMSS.tar.gz -C /

# Restore environment
cp /backups/aluma/env_YYYYMMDD_HHMMSS.backup /home/ubuntu/aluma/.env.production

# Restart services
pm2 restart aluma
sudo systemctl reload nginx
```

## Performance Optimization

### 1. Next.js Optimizations

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  images: {
    domains: ["your-supabase-project.supabase.co"],
    formats: ["image/webp", "image/avif"],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
```

### 2. Database Performance

```sql
-- Enable query plan caching
ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';

-- Optimize for read-heavy workloads
ALTER SYSTEM SET random_page_cost = 1.1;
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET maintenance_work_mem = '256MB';

-- Connection pooling via Supabase
-- Automatic scaling and optimization
```

### 3. CDN Setup

```bash
# Cloudflare setup
# - DNS management
# - CDN acceleration
# - DDoS protection
# - SSL management
```

## Troubleshooting

### Common Deployment Issues

1. **Build Failures**

   ```bash
   # Clear cache and rebuild
   rm -rf .next
   npm run build

   # Check for missing dependencies
   npm audit
   npm install
   ```

2. **Environment Variable Issues**

   ```bash
   # Verify environment variables
   printenv | grep NEXT_PUBLIC

   # Test environment loading
   node -e "console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)"
   ```

3. **Database Connection Issues**

   ```bash
   # Test Supabase connection
   curl -H "apikey: YOUR_ANON_KEY" https://your-project.supabase.co/rest/v1/users

   # Check RLS policies
   # Verify user permissions
   ```

4. **Performance Issues**

   ```bash
   # Monitor resource usage
   top
   iotop

   # Check PM2 status
   pm2 status
   pm2 monit

   # Analyze nginx logs
   sudo tail -f /var/log/nginx/access.log
   ```

### Recovery Commands

```bash
# Emergency restart
pm2 restart all
sudo systemctl restart nginx

# Rollback deployment
git checkout previous-commit
npm run build
pm2 restart aluma

# Database recovery
supabase db reset --linked
```

## Security Checklist

- [ ] HTTPS enabled with valid SSL certificate
- [ ] Environment variables secured (no commits to repo)
- [ ] Database RLS policies enabled
- [ ] Rate limiting configured
- [ ] Security headers implemented
- [ ] Regular security updates applied
- [ ] Backup procedures tested
- [ ] Monitoring and alerting configured
- [ ] Access logs enabled and monitored
- [ ] Firewall rules configured

---

For deployment support or issues, contact the development team or create an issue in the repository.
