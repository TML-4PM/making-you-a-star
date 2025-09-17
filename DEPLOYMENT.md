# Deployment Guide

## Overview

This guide covers deploying the Interview Story & Job Analysis Platform to production environments. The application is optimized for deployment on Vercel, but includes instructions for other platforms.

## Prerequisites

### Required Accounts
- **Supabase Account**: Database and backend services
- **OpenAI Account**: AI analysis features
- **Deployment Platform**: Vercel (recommended), Netlify, or custom server
- **Domain Provider**: For custom domain (optional)

### Required Information
- Supabase project URL and anon key
- OpenAI API key
- Custom domain (if applicable)

## Environment Setup

### Production Environment Variables

Create a `.env.production` file with:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://pflisxkcxbzboxwidywf.supabase.co
VITE_SUPABASE_ANON_KEY=your_production_anon_key

# Application Settings
VITE_APP_URL=https://yourdomain.com
VITE_ENVIRONMENT=production
```

### Supabase Secrets Configuration

Configure these secrets in your Supabase project:

```env
# Edge Function Secrets
OPENAI_API_KEY=your_openai_api_key
```

**To add secrets in Supabase:**
1. Go to Project Settings → Edge Functions
2. Add each secret key-value pair
3. Restart edge functions if needed

## Database Setup

### Production Database Migration

1. **Create Production Project** in Supabase
2. **Apply Migrations**:
   ```bash
   supabase db push --project-ref your-production-ref
   ```

3. **Verify Schema**:
   ```bash
   supabase db diff --project-ref your-production-ref
   ```

### Row Level Security Configuration

Ensure all RLS policies are properly configured:

```sql
-- Verify RLS is enabled on all user tables
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND rowsecurity = false;

-- Should return no rows for user data tables
```

### Database Performance

#### Indexes for Production
```sql
-- Story search performance
CREATE INDEX IF NOT EXISTS idx_interview_stories_search_vector 
ON interview_stories USING gin(search_vector);

-- User story lookups
CREATE INDEX IF NOT EXISTS idx_interview_stories_user_id 
ON interview_stories(user_id);

-- Practice session queries
CREATE INDEX IF NOT EXISTS idx_practice_sessions_user_date 
ON practice_sessions(user_id, created_at DESC);

-- Job description lookups
CREATE INDEX IF NOT EXISTS idx_job_descriptions_user_date 
ON job_descriptions(user_id, created_at DESC);
```

#### Connection Pooling
Supabase automatically handles connection pooling, but monitor usage:
- **Development**: 60 connections max
- **Pro**: 200 connections max  
- **Growth**: 400 connections max

## Deployment Platforms

### Vercel (Recommended)

#### Initial Setup
1. **Connect Repository** to Vercel
2. **Configure Build Settings**:
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Environment Variables**:
   ```
   VITE_SUPABASE_URL=https://pflisxkcxbzboxwidywf.supabase.co
   VITE_SUPABASE_ANON_KEY=your_production_key
   ```

#### Deployment Configuration

Create `vercel.json`:
```json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "functions": {
    "app/api/**/*.js": {
      "runtime": "nodejs18.x"
    }
  },
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

#### Custom Domain Setup
1. **Add Domain** in Vercel dashboard
2. **Configure DNS** records:
   ```
   Type: CNAME
   Name: yourdomain.com
   Value: cname.vercel-dns.com
   ```
3. **SSL Certificate** is automatically provisioned

### Netlify

#### Build Configuration

Create `netlify.toml`:
```toml
[build]
  publish = "dist"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

#### Environment Variables
Add in Netlify dashboard:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### Docker Deployment

#### Dockerfile
```dockerfile
FROM node:18-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### nginx.conf
```nginx
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;

        # SPA routing
        location / {
            try_files $uri $uri/ /index.html;
        }

        # Asset caching
        location /assets/ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header X-Content-Type-Options "nosniff" always;
    }
}
```

## Authentication Configuration

### Supabase Auth Settings

1. **Site URL Configuration**:
   ```
   Site URL: https://yourdomain.com
   ```

2. **Redirect URLs**:
   ```
   https://yourdomain.com/**
   http://localhost:3000/** (for development)
   ```

3. **Email Templates** (optional):
   - Customize confirmation emails
   - Brand with your colors/logo
   - Include helpful onboarding information

### Social Login Setup (Optional)

Configure OAuth providers:

#### Google OAuth
1. **Google Cloud Console** → Create OAuth 2.0 credentials
2. **Authorized redirect URIs**:
   ```
   https://pflisxkcxbzboxwidywf.supabase.co/auth/v1/callback
   ```
3. **Supabase Dashboard** → Authentication → Providers → Google
4. **Add credentials** from Google Cloud Console

#### GitHub OAuth
1. **GitHub Settings** → Developer settings → OAuth Apps
2. **Authorization callback URL**:
   ```
   https://pflisxkcxbzboxwidywf.supabase.co/auth/v1/callback
   ```
3. **Supabase Dashboard** → Authentication → Providers → GitHub
4. **Add Client ID and Secret**

## Performance Optimization

### Build Optimization

#### Vite Configuration Updates
```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          supabase: ['@supabase/supabase-js'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
})
```

#### Asset Optimization
- **Images**: Compress and convert to WebP format
- **Fonts**: Use font-display: swap for better loading
- **Bundle Analysis**: Use `npm run build -- --analyze`

### Runtime Performance

#### Code Splitting Implementation
```typescript
// Lazy load pages
const StoriesPage = lazy(() => import('./pages/StoriesPage'))
const JobDescriptionsPage = lazy(() => import('./pages/JobDescriptionsPage'))

// Wrap with Suspense
<Suspense fallback={<div>Loading...</div>}>
  <Routes>
    <Route path="/stories" element={<StoriesPage />} />
    <Route path="/jobs" element={<JobDescriptionsPage />} />
  </Routes>
</Suspense>
```

#### React Query Configuration
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error) => {
        if (error.status === 404) return false
        return failureCount < 3
      }
    }
  }
})
```

## Monitoring & Analytics

### Error Tracking

#### Sentry Setup (Optional)
```bash
npm install @sentry/react @sentry/tracing
```

```typescript
// src/main.tsx
import * as Sentry from "@sentry/react"

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: import.meta.env.MODE,
  tracesSampleRate: 1.0,
})
```

### Performance Monitoring

#### Web Vitals Tracking
```typescript
// src/utils/analytics.ts
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'

function sendToAnalytics(metric) {
  // Send to your analytics service
  console.log(metric)
}

getCLS(sendToAnalytics)
getFID(sendToAnalytics)
getFCP(sendToAnalytics)
getLCP(sendToAnalytics)
getTTFB(sendToAnalytics)
```

### Application Monitoring

#### Health Check Endpoint
Create a simple health check for monitoring:

```typescript
// src/api/health.ts
export const healthCheck = async () => {
  try {
    const { data, error } = await supabase
      .from('interview_stories')
      .select('id')
      .limit(1)
    
    return {
      status: 'healthy',
      database: error ? 'error' : 'connected',
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    }
  }
}
```

## Security Configuration

### Content Security Policy

Add CSP headers for security:

```html
<!-- index.html -->
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://pflisxkcxbzboxwidywf.supabase.co;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  connect-src 'self' https://pflisxkcxbzboxwidywf.supabase.co https://api.openai.com;
  font-src 'self';
  frame-src 'none';
">
```

### HTTPS Enforcement

Ensure HTTPS is enforced:
- **Vercel/Netlify**: Automatic HTTPS redirect
- **Custom deployment**: Configure reverse proxy

### Rate Limiting

Implement client-side rate limiting:

```typescript
// src/utils/rateLimiter.ts
const rateLimiter = new Map()

export const checkRateLimit = (key: string, limit: number, window: number) => {
  const now = Date.now()
  const userRequests = rateLimiter.get(key) || []
  
  // Remove old requests outside the window
  const validRequests = userRequests.filter(
    (timestamp: number) => now - timestamp < window
  )
  
  if (validRequests.length >= limit) {
    return false // Rate limit exceeded
  }
  
  validRequests.push(now)
  rateLimiter.set(key, validRequests)
  return true
}
```

## Backup Strategy

### Database Backups

Supabase provides automatic backups:
- **Free tier**: 7-day backup retention
- **Pro tier**: Point-in-time recovery
- **Custom backups**: Use `pg_dump` for additional backups

#### Manual Backup Script
```bash
#!/bin/bash
# backup.sh
pg_dump "postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres" \
  --clean --if-exists --quote-all-identifiers \
  > backup_$(date +%Y%m%d_%H%M%S).sql
```

### User Data Export

Implement data export functionality:

```typescript
// src/utils/dataExport.ts
export const exportUserData = async (userId: string) => {
  const { data: stories } = await supabase
    .from('interview_stories')
    .select('*')
    .eq('user_id', userId)
  
  const { data: jobs } = await supabase
    .from('job_descriptions')
    .select('*')
    .eq('user_id', userId)
  
  return {
    stories,
    jobs,
    exportDate: new Date().toISOString()
  }
}
```

## Maintenance

### Regular Updates

#### Security Updates
- **Weekly**: Review and apply security updates
- **Monthly**: Update all dependencies
- **Quarterly**: Review and update Supabase configuration

#### Performance Reviews
- **Monthly**: Review application performance metrics
- **Quarterly**: Analyze user behavior and optimize flows
- **Annually**: Comprehensive architecture review

### Database Maintenance

#### Query Performance
```sql
-- Check slow queries
SELECT query, mean_exec_time, calls 
FROM pg_stat_statements 
ORDER BY mean_exec_time DESC 
LIMIT 10;

-- Check table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

#### Cleanup Scripts
```sql
-- Clean up old sessions (run monthly)
DELETE FROM practice_sessions 
WHERE created_at < NOW() - INTERVAL '6 months';

-- Analyze tables for query optimization
ANALYZE interview_stories;
ANALYZE job_descriptions;
```

## Rollback Procedures

### Application Rollback

#### Vercel Rollback
1. **Vercel Dashboard** → Deployments
2. **Select previous deployment** → Promote to Production
3. **Verify functionality** after rollback

#### Database Rollback
1. **Create backup** of current state
2. **Apply previous migration**:
   ```bash
   supabase db reset --project-ref your-project-ref
   ```
3. **Verify data integrity**

### Emergency Procedures

#### Service Outage Response
1. **Check Supabase status**: https://status.supabase.com
2. **Verify deployment platform** status
3. **Enable maintenance mode** if needed
4. **Communicate with users** about service status

#### Data Recovery
1. **Assess data loss** scope and impact
2. **Restore from most recent backup**
3. **Verify data integrity** with sample checks
4. **Notify affected users** if necessary

## Support & Documentation

### Production Support

#### Monitoring Checklist
- [ ] Application health checks
- [ ] Database connection monitoring
- [ ] Error rate tracking
- [ ] Performance metrics
- [ ] User feedback monitoring

#### Support Contacts
- **Platform Issues**: Your deployment platform support
- **Database Issues**: Supabase support
- **AI Issues**: OpenAI support  
- **Domain/DNS**: Your domain provider

### Documentation Maintenance

Keep documentation updated:
- **Deployment procedures**: Update after any changes
- **Environment variables**: Document all required variables
- **Dependencies**: Track version requirements
- **Security procedures**: Update security practices regularly

---

## Quick Deployment Checklist

### Pre-Deployment
- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Database migrations ready
- [ ] Secrets configured in Supabase
- [ ] Performance testing completed

### Deployment
- [ ] Deploy to staging first
- [ ] Verify all functionality
- [ ] Deploy to production
- [ ] Verify production deployment
- [ ] Update DNS if needed

### Post-Deployment
- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Verify authentication flows
- [ ] Test AI functionality
- [ ] Update documentation

### Production Health Check
- [ ] Homepage loads correctly
- [ ] User can sign up/login
- [ ] Stories can be created/edited
- [ ] Job analysis works
- [ ] AI features functional
- [ ] Mobile responsive design works