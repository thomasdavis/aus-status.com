# Implementation Guide

This document outlines how to implement real-time monitoring for the Australia Status site.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                       Frontend (Next.js)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Timeline   │  │   Services   │  │  Incidents   │      │
│  │  Component   │  │   Status     │  │   History    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Routes (Next.js)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ /api/status  │  │/api/incidents│  │/api/subscribe│      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Background Workers                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Service Monitor (every 60s)                          │  │
│  │  - HTTP health checks                                 │  │
│  │  - Status page scraping                               │  │
│  │  - API polling                                        │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  News Monitor (every 5min)                            │  │
│  │  - RSS feeds (ABC, 9News, official)                   │  │
│  │  - Social media (Twitter/X official accounts)         │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Parliament Monitor (every 15min)                     │  │
│  │  - Bills status                                       │  │
│  │  - Supply/appropriations                              │  │
│  │  - Vote results                                       │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Database (PostgreSQL)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   services   │  │  incidents   │  │ subscribers  │      │
│  │  (status)    │  │  (history)   │  │  (alerts)    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

## Data Sources

### 1. Official Status Pages

#### myGov
- **URL**: https://my.gov.au/systemstatus
- **Method**: HTTP GET + HTML parsing
- **Frequency**: Every 60 seconds
- **Indicators**: Look for status badges, system messages
- **Fallback**: HTTP health check on https://my.gov.au

#### Australian Taxation Office (ATO)
- **URL**: https://www.ato.gov.au/About-ATO/About-us/System-status/
- **Method**: HTML parsing
- **Frequency**: Every 60 seconds
- **Indicators**: Service status table

#### Services Australia
- **URL**: https://www.servicesaustralia.gov.au/system-maintenance-and-outages
- **Method**: HTML parsing
- **Frequency**: Every 60 seconds
- **Covers**: Centrelink, Medicare, Child Support

### 2. News Sources

#### ABC News
- **RSS**: https://www.abc.net.au/news/feed/51120/rss.xml (Politics)
- **Keywords**: "government shutdown", "supply", "appropriation", "crisis"
- **Frequency**: Every 5 minutes

#### 9News
- **RSS**: https://www.9news.com.au/rss (Politics section)
- **Frequency**: Every 5 minutes

#### Official Government Media
- **URL**: https://ministers.pmc.gov.au/
- **Method**: RSS + web scraping
- **Frequency**: Every 15 minutes

### 3. Parliamentary Data

#### Parliament of Australia
- **Bills API**: https://www.aph.gov.au/Parliamentary_Business/Bills_Legislation
- **Hansard**: https://www.aph.gov.au/Parliamentary_Business/Hansard
- **Method**: Web scraping + API (if available)
- **Focus**: Supply bills, appropriation bills, confidence votes
- **Frequency**: Every 15 minutes when parliament is sitting

### 4. Social Media

#### Twitter/X Official Accounts
- @ausgov
- @servicesaustralia
- @ato_gov_au
- @mygovau
- @financeminister
- @treasureraus

**Method**: Twitter API v2 (requires API key)
**Frequency**: Real-time stream or every 5 minutes

## Implementation Steps

### Phase 1: Infrastructure Setup

1. **Database Setup** (PostgreSQL)
   ```bash
   # See schema.sql for full schema
   psql -U postgres -d australia_status -f schema.sql
   ```

2. **Environment Variables**
   ```env
   # Database
   DATABASE_URL=postgresql://user:password@localhost:5432/australia_status

   # API Keys
   TWITTER_API_KEY=your_key_here
   TWITTER_API_SECRET=your_secret_here

   # Monitoring
   HEALTH_CHECK_INTERVAL=60000  # 60 seconds
   NEWS_CHECK_INTERVAL=300000   # 5 minutes

   # Alerts
   TWILIO_ACCOUNT_SID=your_sid
   TWILIO_AUTH_TOKEN=your_token
   TWILIO_PHONE_NUMBER=+61...

   # Email
   SMTP_HOST=smtp.sendgrid.net
   SMTP_USER=apikey
   SMTP_PASS=your_api_key
   ```

3. **Install Dependencies**
   ```bash
   npm install @vercel/postgres
   npm install cheerio  # HTML parsing
   npm install rss-parser  # RSS feeds
   npm install twitter-api-v2  # Twitter monitoring
   npm install twilio  # SMS alerts
   npm install nodemailer  # Email alerts
   ```

### Phase 2: Service Monitoring

1. **Create Health Check Worker** (`lib/workers/health-check.ts`)
   - Poll each service every 60 seconds
   - Perform HTTP HEAD requests
   - Parse status pages
   - Store results in database
   - Trigger alerts on status changes

2. **Create Status Page Scrapers** (`lib/scrapers/`)
   - `mygov.ts` - Parse myGov status page
   - `ato.ts` - Parse ATO system status
   - `services-australia.ts` - Parse Services Australia outages page
   - Each scraper returns normalized status: operational | degraded | outage

3. **Set Up Cron Jobs** (Vercel Cron or separate worker)
   ```typescript
   // vercel.json
   {
     "crons": [
       {
         "path": "/api/cron/health-check",
         "schedule": "* * * * *"  // Every minute
       },
       {
         "path": "/api/cron/news-monitor",
         "schedule": "*/5 * * * *"  // Every 5 minutes
       },
       {
         "path": "/api/cron/parliament-monitor",
         "schedule": "*/15 * * * *"  // Every 15 minutes
       }
     ]
   }
   ```

### Phase 3: News & Social Monitoring

1. **RSS Feed Monitor** (`lib/monitors/rss.ts`)
   - Parse ABC News, 9News feeds
   - Filter for relevant keywords
   - Store new articles
   - Create incidents if keywords match

2. **Twitter Monitor** (`lib/monitors/twitter.ts`)
   - Stream official government accounts
   - Look for service announcements
   - Create incidents for outage tweets

3. **Parliament Monitor** (`lib/monitors/parliament.ts`)
   - Check bills database
   - Monitor supply bill status
   - Track vote results
   - Alert on supply issues

### Phase 4: Incident Management

1. **Automated Incident Creation**
   - Detect service outages (3+ consecutive failed health checks)
   - Parse news articles for major incidents
   - Create draft incidents for manual verification

2. **Manual Verification Workflow**
   - Admin dashboard to review auto-detected incidents
   - Add sources, descriptions, affected services
   - Publish verified incidents

3. **Incident Resolution**
   - Auto-detect when services recover
   - Update end date and duration
   - Archive resolved incidents

### Phase 5: Alerting System

1. **Subscriber Management**
   - Email subscription form
   - SMS subscription (via Twilio)
   - Telegram bot
   - Email verification

2. **Alert Triggers**
   - New incident detected
   - Service status change
   - Constitutional/parliamentary issues
   - Customizable alert preferences

3. **Alert Delivery**
   - Email templates (Nodemailer)
   - SMS via Twilio
   - Telegram messages
   - In-app notifications

### Phase 6: Admin Dashboard

1. **Authentication** (NextAuth.js)
   - Admin login
   - Role-based access

2. **Incident Management**
   - Create/edit/delete incidents
   - Upload sources
   - Verify auto-detected incidents

3. **Service Configuration**
   - Add/remove monitored services
   - Configure health check URLs
   - Set alert thresholds

4. **Analytics**
   - Uptime statistics
   - Incident frequency
   - Service reliability reports

## Production Deployment Checklist

- [ ] Set up PostgreSQL database
- [ ] Configure environment variables
- [ ] Enable Vercel Cron jobs
- [ ] Set up Twitter API access
- [ ] Configure Twilio for SMS
- [ ] Set up email service (SendGrid/Mailgun)
- [ ] Implement rate limiting on APIs
- [ ] Add Redis caching for service status
- [ ] Set up monitoring (Sentry/DataDog)
- [ ] Configure CDN for static assets
- [ ] Enable security headers
- [ ] Set up backup system for database
- [ ] Create admin user accounts
- [ ] Test alert delivery
- [ ] Document API endpoints
- [ ] Create runbook for incidents

## Monitoring Costs (Estimated)

- **Vercel Pro**: $20/month (for cron jobs)
- **PostgreSQL (Supabase/Neon)**: $10-25/month
- **Twitter API**: $100/month (Basic tier)
- **Twilio SMS**: ~$0.01/SMS (pay as you go)
- **SendGrid Email**: Free (up to 100/day) or $20/month
- **Domain + SSL**: $15/year

**Total**: ~$150-200/month for full production setup

## Scaling Considerations

1. **Database**: Use connection pooling (PgBouncer)
2. **Caching**: Redis for service status (reduce DB load)
3. **Workers**: Separate worker instances for heavy scraping
4. **CDN**: CloudFlare for static assets and DDoS protection
5. **Monitoring**: Set up alerts for worker failures
6. **Backups**: Daily database backups to S3

## Security

1. **API Rate Limiting**: Prevent abuse
2. **CORS**: Restrict API access
3. **Input Validation**: Sanitize all user input
4. **SQL Injection**: Use parameterized queries
5. **XSS Protection**: Escape all output
6. **HTTPS Only**: Force SSL
7. **Authentication**: Secure admin access
8. **API Keys**: Store in environment variables
9. **Logging**: Track all admin actions
10. **DDoS Protection**: CloudFlare

## Contributing

To add new data sources or improve monitoring:

1. Fork the repository
2. Add new scraper in `lib/scrapers/`
3. Add tests
4. Submit pull request with documentation
5. Include example output and error handling

## License

MIT License - See LICENSE file
