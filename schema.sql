-- Database schema for Australia Status monitoring system

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Services table: tracks all monitored government services
CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_key VARCHAR(50) UNIQUE NOT NULL,  -- e.g., 'mygov', 'ato'
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,  -- 'core', 'taxation', 'social-services', etc.
    url TEXT,
    status_page_url TEXT,
    health_check_url TEXT,
    health_check_method VARCHAR(10) DEFAULT 'HEAD',
    current_status VARCHAR(20) DEFAULT 'unknown',  -- 'operational', 'degraded', 'outage', 'unknown'
    last_checked TIMESTAMP,
    enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Service status history: tracks status changes over time
CREATE TABLE service_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_id UUID REFERENCES services(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL,
    response_time_ms INTEGER,
    http_status_code INTEGER,
    error_message TEXT,
    checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_service_status_time (service_id, checked_at DESC)
);

-- Incidents table: major disruptions and outages
CREATE TABLE incidents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(500) NOT NULL,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP,
    duration_days INTEGER,
    type VARCHAR(50) NOT NULL,  -- 'constitutional-crisis', 'service-outage', etc.
    severity VARCHAR(20) NOT NULL,  -- 'critical', 'major', 'minor'
    description TEXT,
    resolution TEXT,
    status VARCHAR(20) DEFAULT 'ongoing',  -- 'ongoing', 'resolved', 'investigating'
    verified BOOLEAN DEFAULT false,  -- manual verification required
    auto_detected BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    INDEX idx_incidents_date (start_date DESC),
    INDEX idx_incidents_status (status, verified)
);

-- Incident affected services: many-to-many relationship
CREATE TABLE incident_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_id UUID REFERENCES incidents(id) ON DELETE CASCADE,
    service_id UUID REFERENCES services(id) ON DELETE CASCADE,
    impact_description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(incident_id, service_id)
);

-- Incident sources: URLs and references for each incident
CREATE TABLE incident_sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_id UUID REFERENCES incidents(id) ON DELETE CASCADE,
    source_type VARCHAR(50),  -- 'news', 'official', 'social', 'parliamentary'
    source_name VARCHAR(255),
    url TEXT NOT NULL,
    title TEXT,
    published_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_incident_sources (incident_id)
);

-- News monitoring: tracks news articles for potential incidents
CREATE TABLE news_articles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source VARCHAR(100) NOT NULL,  -- 'abc-news', '9news', etc.
    title TEXT NOT NULL,
    description TEXT,
    url TEXT UNIQUE NOT NULL,
    published_at TIMESTAMP,
    content TEXT,
    keywords TEXT[],
    relevance_score FLOAT,  -- 0-1, how likely this is a real incident
    processed BOOLEAN DEFAULT false,
    incident_id UUID REFERENCES incidents(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_news_published (published_at DESC),
    INDEX idx_news_processed (processed, relevance_score DESC)
);

-- Social media monitoring: tracks official account posts
CREATE TABLE social_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    platform VARCHAR(50) NOT NULL,  -- 'twitter', 'facebook', etc.
    account VARCHAR(100) NOT NULL,
    post_id VARCHAR(255) UNIQUE NOT NULL,
    text TEXT NOT NULL,
    url TEXT,
    posted_at TIMESTAMP,
    is_service_announcement BOOLEAN DEFAULT false,
    severity VARCHAR(20),  -- 'info', 'warning', 'critical'
    incident_id UUID REFERENCES incidents(id),
    processed BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_social_posted (posted_at DESC),
    INDEX idx_social_processed (processed, is_service_announcement)
);

-- Parliamentary business: track supply bills and votes
CREATE TABLE parliamentary_bills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bill_id VARCHAR(100) UNIQUE NOT NULL,
    title TEXT NOT NULL,
    bill_type VARCHAR(50),  -- 'supply', 'appropriation', 'other'
    status VARCHAR(50) NOT NULL,  -- 'introduced', 'passed', 'blocked', 'assented'
    house VARCHAR(50),  -- 'representatives', 'senate'
    introduced_date DATE,
    last_action_date DATE,
    url TEXT,
    is_supply_bill BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_bills_status (status, is_supply_bill),
    INDEX idx_bills_date (last_action_date DESC)
);

-- Subscribers: users who want notifications
CREATE TABLE subscribers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(50) UNIQUE,
    telegram_id VARCHAR(100) UNIQUE,
    verified BOOLEAN DEFAULT false,
    verification_token VARCHAR(255),
    preferences JSONB DEFAULT '{
        "email_enabled": true,
        "sms_enabled": false,
        "telegram_enabled": false,
        "severity_threshold": "major",
        "incident_types": ["constitutional-crisis", "service-outage"]
    }'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_notification_at TIMESTAMP,
    CHECK (email IS NOT NULL OR phone IS NOT NULL OR telegram_id IS NOT NULL)
);

-- Notifications log: track all sent notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subscriber_id UUID REFERENCES subscribers(id) ON DELETE CASCADE,
    incident_id UUID REFERENCES incidents(id),
    notification_type VARCHAR(20) NOT NULL,  -- 'email', 'sms', 'telegram'
    subject VARCHAR(500),
    message TEXT NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'sent',  -- 'sent', 'failed', 'bounced'
    error_message TEXT,
    INDEX idx_notifications_sent (sent_at DESC),
    INDEX idx_notifications_subscriber (subscriber_id, sent_at DESC)
);

-- Admin users
CREATE TABLE admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'editor',  -- 'admin', 'editor', 'viewer'
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit log: track all admin actions
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_user_id UUID REFERENCES admin_users(id),
    action VARCHAR(100) NOT NULL,  -- 'create_incident', 'update_service', etc.
    entity_type VARCHAR(50),
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_audit_time (created_at DESC),
    INDEX idx_audit_user (admin_user_id, created_at DESC)
);

-- Create indexes for performance
CREATE INDEX idx_service_status_current ON services(current_status, enabled);
CREATE INDEX idx_incidents_ongoing ON incidents(status, start_date DESC) WHERE status = 'ongoing';

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_incidents_updated_at BEFORE UPDATE ON incidents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscribers_updated_at BEFORE UPDATE ON subscribers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert initial services
INSERT INTO services (service_key, name, category, url, status_page_url, current_status) VALUES
    ('mygov', 'myGov', 'core', 'https://my.gov.au', 'https://my.gov.au/systemstatus', 'operational'),
    ('ato', 'Australian Taxation Office', 'taxation', 'https://www.ato.gov.au', 'https://www.ato.gov.au/About-ATO/About-us/System-status/', 'operational'),
    ('services-australia', 'Services Australia', 'social-services', 'https://www.servicesaustralia.gov.au', 'https://www.servicesaustralia.gov.au/system-maintenance-and-outages', 'operational'),
    ('medicare', 'Medicare', 'health', 'https://www.servicesaustralia.gov.au/medicare', 'https://www.servicesaustralia.gov.au/system-maintenance-and-outages', 'operational'),
    ('centrelink', 'Centrelink', 'social-services', 'https://www.servicesaustralia.gov.au/centrelink', 'https://www.servicesaustralia.gov.au/system-maintenance-and-outages', 'operational'),
    ('parliament', 'Parliament of Australia', 'parliament', 'https://www.aph.gov.au', 'https://www.aph.gov.au', 'operational'),
    ('abs', 'Australian Bureau of Statistics', 'other', 'https://www.abs.gov.au', NULL, 'operational');

-- Insert historical incidents
INSERT INTO incidents (name, start_date, end_date, duration_days, type, severity, description, status, verified) VALUES
    (
        '1975 Australian Constitutional Crisis',
        '1975-10-15',
        '1975-11-11',
        27,
        'constitutional-crisis',
        'critical',
        'The Governor-General dismissed Prime Minister Gough Whitlam after the Opposition-controlled Senate blocked supply (budget bills). While this created a constitutional crisis, essential government services continued to operate. The crisis was resolved when caretaker PM Malcolm Fraser was appointed and elections were called.',
        'resolved',
        true
    ),
    (
        'MyGov System Outage',
        '2021-06-01',
        '2021-06-02',
        1,
        'service-outage',
        'major',
        'Major outage affecting myGov portal, preventing access to Centrelink, Medicare, and ATO services for millions of Australians.',
        'resolved',
        true
    ),
    (
        'Census Website Failure',
        '2016-08-09',
        '2016-08-11',
        2,
        'service-outage',
        'major',
        'The Australian Bureau of Statistics (ABS) census website crashed on census night due to DDoS attacks and infrastructure issues, preventing millions from completing the census online.',
        'resolved',
        true
    ),
    (
        'Medicare Outage',
        '2022-03-14',
        '2022-03-15',
        1,
        'service-outage',
        'major',
        'Medicare''s payment systems experienced widespread outages affecting GP clinics and pharmacies across Australia.',
        'resolved',
        true
    );

-- Add sources for 1975 crisis
INSERT INTO incident_sources (incident_id, source_type, source_name, url)
SELECT
    id,
    'official',
    'Parliament of Australia',
    'https://www.aph.gov.au/About_Parliament/Senate/Practice_and_Procedure/platparl/c04'
FROM incidents WHERE name = '1975 Australian Constitutional Crisis';

INSERT INTO incident_sources (incident_id, source_type, source_name, url)
SELECT
    id,
    'official',
    'Parliamentary Education Office',
    'https://peo.gov.au/understand-our-parliament/your-questions-on-notice/questions/what-happens-when-a-supply-bill-is-blocked-why-was-supply-blocked-in-1975'
FROM incidents WHERE name = '1975 Australian Constitutional Crisis';

-- Views for common queries
CREATE VIEW service_uptime_summary AS
SELECT
    s.id,
    s.name,
    s.category,
    s.current_status,
    COUNT(CASE WHEN ssh.status = 'operational' THEN 1 END)::FLOAT / NULLIF(COUNT(*), 0) * 100 AS uptime_percentage_24h,
    COUNT(CASE WHEN ssh.status != 'operational' THEN 1 END) AS outage_count_24h
FROM services s
LEFT JOIN service_status_history ssh ON s.id = ssh.service_id
    AND ssh.checked_at > CURRENT_TIMESTAMP - INTERVAL '24 hours'
GROUP BY s.id, s.name, s.category, s.current_status;

CREATE VIEW recent_incidents AS
SELECT
    i.id,
    i.name,
    i.start_date,
    i.end_date,
    i.duration_days,
    i.type,
    i.severity,
    i.status,
    COUNT(DISTINCT ise.service_id) AS affected_services_count,
    COUNT(DISTINCT iso.id) AS source_count
FROM incidents i
LEFT JOIN incident_services ise ON i.id = ise.incident_id
LEFT JOIN incident_sources iso ON i.id = iso.incident_id
WHERE i.start_date > CURRENT_TIMESTAMP - INTERVAL '30 days' OR i.status = 'ongoing'
GROUP BY i.id, i.name, i.start_date, i.end_date, i.duration_days, i.type, i.severity, i.status
ORDER BY i.start_date DESC;

COMMENT ON TABLE services IS 'Government services being monitored for uptime';
COMMENT ON TABLE incidents IS 'Major disruptions, outages, and constitutional crises';
COMMENT ON TABLE subscribers IS 'Users subscribed to receive status alerts';
COMMENT ON TABLE audit_log IS 'Track all administrative actions for accountability';
