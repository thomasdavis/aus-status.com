# Data Sources Reference

Complete list of data sources for monitoring Australian Government services and incidents.

## Official Government Status Pages

### myGov
- **Main URL**: https://my.gov.au
- **Status Page**: https://my.gov.au/systemstatus
- **Update Frequency**: Real-time
- **What to Monitor**: System availability, maintenance notices
- **Parsing Method**: HTML scraping (look for status indicators)
- **Fallback**: HTTP HEAD request to main URL

### Australian Taxation Office (ATO)
- **Main URL**: https://www.ato.gov.au
- **Status Page**: https://www.ato.gov.au/About-ATO/About-us/System-status/
- **Update Frequency**: Real-time
- **What to Monitor**: Service availability table, planned outages
- **Parsing Method**: HTML table parsing
- **API**: None publicly available

### Services Australia
- **Main URL**: https://www.servicesaustralia.gov.au
- **Status Page**: https://www.servicesaustralia.gov.au/system-maintenance-and-outages
- **Covers**: Centrelink, Medicare, Child Support, etc.
- **Update Frequency**: Real-time
- **What to Monitor**: System status, scheduled maintenance
- **Parsing Method**: HTML scraping
- **Note**: Single status page for multiple services

### Medicare
- **Main URL**: https://www.servicesaustralia.gov.au/medicare
- **Status Page**: Same as Services Australia (above)
- **Update Frequency**: Real-time

### Centrelink
- **Main URL**: https://www.servicesaustralia.gov.au/centrelink
- **Status Page**: Same as Services Australia (above)
- **Update Frequency**: Real-time

### Parliament of Australia
- **Main URL**: https://www.aph.gov.au
- **Bills Database**: https://www.aph.gov.au/Parliamentary_Business/Bills_Legislation
- **Hansard**: https://www.aph.gov.au/Parliamentary_Business/Hansard
- **Update Frequency**: Daily (when parliament sitting)
- **What to Monitor**:
  - Supply bills status
  - Appropriation bills
  - Vote results
  - Confidence motions

### Australian Bureau of Statistics (ABS)
- **Main URL**: https://www.abs.gov.au
- **Status Page**: None official
- **Update Frequency**: N/A
- **What to Monitor**: Census operations (when active)

## News Sources

### ABC News
- **Main RSS**: https://www.abc.net.au/news/feed/51120/rss.xml (Politics)
- **Keywords to Monitor**:
  - "government shutdown"
  - "supply bill"
  - "appropriation"
  - "constitutional crisis"
  - "government services"
  - "mygov outage"
  - "centrelink down"
  - "medicare outage"
  - "ato system"
- **Update Frequency**: Every 5 minutes
- **Credibility**: High (national broadcaster)

### 9News
- **Main RSS**: https://www.9news.com.au/rss
- **Politics URL**: https://www.9news.com.au/politics
- **Keywords**: Same as ABC News
- **Update Frequency**: Every 5 minutes
- **Credibility**: High (major network)

### The Guardian Australia
- **Politics RSS**: https://www.theguardian.com/australia-news/australian-politics/rss
- **Update Frequency**: Every 5 minutes
- **Credibility**: High

### News.com.au
- **Politics RSS**: https://www.news.com.au/national/politics/rss
- **Update Frequency**: Every 5 minutes
- **Credibility**: Medium-High

### Official Government Media
- **Prime Minister's Office**: https://www.pm.gov.au/media
- **Ministers Media**: https://ministers.pmc.gov.au/
- **Update Frequency**: Every 15 minutes
- **What to Monitor**: Media releases about service disruptions
- **Parsing Method**: RSS + HTML scraping

## Social Media Sources

### Twitter/X Official Accounts

#### Government Services
- **@ausgov** - Australian Government official account
- **@servicesaustralia** - Services Australia
- **@mygovau** - myGov
- **@ato_gov_au** - Australian Taxation Office
- **@ABSstats** - Australian Bureau of Statistics

#### Political
- **@AlboMP** - Prime Minister Anthony Albanese
- **@JEChalmers** - Treasurer Jim Chalmers
- **@KatyGallagherMP** - Minister for Finance
- **@SenatorWong** - Minister for Foreign Affairs
- **@AustralianLabor** - Australian Labor Party
- **@LiberalAus** - Liberal Party of Australia

#### News Organizations
- **@abcnews** - ABC News
- **@9NewsAUS** - 9News
- **@GuardianAus** - The Guardian Australia

### Implementation
- **API**: Twitter API v2 (requires paid tier for real-time)
- **Method**: Filtered stream or search recent tweets
- **Frequency**: Real-time stream or every 5 minutes
- **Keywords**: Same as news monitoring

## Parliamentary Data

### Bills and Votes
- **Bills Search**: https://www.aph.gov.au/Parliamentary_Business/Bills_Legislation
- **Search Parameters**:
  - Type: "Appropriation"
  - Type: "Supply"
  - Status: All
- **Update Frequency**: Every 15 minutes when parliament sitting
- **Parsing Method**: HTML scraping (no official API)

### Hansard (Parliamentary Debates)
- **URL**: https://www.aph.gov.au/Parliamentary_Business/Hansard
- **Search**: Full-text search for "supply" mentions
- **Update Frequency**: Daily
- **Format**: PDF and HTML

### Senate Notices
- **URL**: https://www.aph.gov.au/Parliamentary_Business/Chamber_documents/Senate_chamber_documents
- **What to Monitor**: Blocking of supply bills
- **Update Frequency**: Daily when senate sitting

## Historical Data Sources

### 1975 Constitutional Crisis
- **Parliament of Australia**: https://www.aph.gov.au/About_Parliament/Senate/Practice_and_Procedure/platparl/c04
- **Parliamentary Education Office**: https://peo.gov.au/understand-our-parliament/your-questions-on-notice/questions/what-happens-when-a-supply-bill-is-blocked-why-was-supply-blocked-in-1975
- **National Archives**: https://www.naa.gov.au/explore-collection/australias-prime-ministers/gough-whitlam

### Service Outages
- **ABC News Archive**: Search for service names + "outage"
- **Wayback Machine**: https://web.archive.org (for historical status pages)
- **Government Annual Reports**: Often mention significant outages

## API Endpoints (When Available)

### data.gov.au
- **URL**: https://data.gov.au
- **API**: https://data.gov.au/data/api/3
- **Use**: Some datasets available via API
- **Rate Limit**: 100 requests per minute

## RSS Feeds Summary

| Source | URL | Update | Priority |
|--------|-----|--------|----------|
| ABC News Politics | https://www.abc.net.au/news/feed/51120/rss.xml | 5min | High |
| 9News | https://www.9news.com.au/rss | 5min | High |
| Guardian AU Politics | https://www.theguardian.com/australia-news/australian-politics/rss | 5min | Medium |
| PM Media | https://www.pm.gov.au/media/feed | 15min | High |
| Ministers Media | https://ministers.pmc.gov.au/feed | 15min | High |

## Health Check Endpoints

| Service | URL | Method | Timeout |
|---------|-----|--------|---------|
| myGov | https://my.gov.au | HEAD | 5s |
| ATO | https://www.ato.gov.au | HEAD | 5s |
| Services Australia | https://www.servicesaustralia.gov.au | HEAD | 5s |
| Parliament | https://www.aph.gov.au | HEAD | 5s |
| ABS | https://www.abs.gov.au | HEAD | 5s |

## Status Indicators

### myGov Status Page
- **Green/Operational**: "All systems operational" or "Available"
- **Yellow/Degraded**: "Experiencing issues" or "Partial outage"
- **Red/Outage**: "Unavailable" or "Major outage"

### ATO Status Page
- **Table Format**: Service name | Status | Last Updated
- **Green**: "Available"
- **Yellow**: "Degraded performance"
- **Red**: "Unavailable"

### Services Australia
- **Alert Banners**: Look for red/yellow banners
- **Text Indicators**: "planned maintenance", "unplanned outage", "service disruption"

## Rate Limits & Best Practices

### HTTP Health Checks
- **Frequency**: Every 60 seconds
- **Timeout**: 5 seconds
- **User Agent**: "AusStatus/1.0 (https://aus-status.com; monitoring@aus-status.com)"
- **Respect**: robots.txt

### RSS Feeds
- **Frequency**: Every 5 minutes
- **Cache**: Store last modified date
- **Conditional**: Use If-Modified-Since headers

### Twitter API
- **Rate Limits**: Varies by tier
  - Essential: 500k tweets/month
  - Elevated: Limited
  - Pro: $100/month for real-time
- **Best Practice**: Use filtered stream for real-time

### Web Scraping
- **Delay**: 1-2 seconds between requests
- **Cache**: Cache pages for 60 seconds minimum
- **Headers**: Include User-Agent and From
- **Errors**: Implement exponential backoff
- **Legal**: Check terms of service

## Alerting Thresholds

### Service Status
- **3 consecutive failures** = Create incident
- **5 minutes downtime** = Send alerts
- **Recovery** = Close incident, send all-clear

### News Monitoring
- **Relevance score > 0.7** = Flag for manual review
- **Multiple sources** = Auto-create draft incident
- **Official confirmation** = Publish incident

### Social Media
- **Official account tweet** = High priority
- **Keywords match** = Medium priority
- **Retweets > 100** = Flag for review

## Contact Information for Manual Verification

### Press Offices
- **Services Australia**: mediateam@servicesaustralia.gov.au
- **ATO**: atotalk@ato.gov.au
- **Department of Finance**: media@finance.gov.au

### Emergency Contacts
Only use for critical issues requiring immediate verification.

## Contribution Guidelines

When adding new data sources:

1. **Verify Reliability**: Check multiple times over several days
2. **Document Format**: Exact structure of data
3. **Test Parsing**: Include example output
4. **Error Handling**: Document error cases
5. **Rate Limits**: Note any restrictions
6. **Maintenance**: Contact info if source goes down

## Future Data Sources to Add

- [ ] State government status pages (NSW, VIC, QLD, etc.)
- [ ] Essential services (Australia Post, NBN, etc.)
- [ ] Emergency services status
- [ ] NDIS service status
- [ ] DVA (Department of Veterans' Affairs)
- [ ] Home Affairs / Immigration status

---

**Last Updated**: October 2025
**Maintained By**: Australia Status Team
**Questions**: See IMPLEMENTATION.md or open an issue
