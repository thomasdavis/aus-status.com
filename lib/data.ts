// Historical government disruptions and incidents in Australia

export interface GovernmentIncident {
  name: string;
  startDate: Date;
  endDate: Date;
  duration: number; // days
  type: 'constitutional-crisis' | 'partial-disruption' | 'service-outage' | 'funding-delay';
  severity: 'critical' | 'major' | 'minor';
  description: string;
  affectedServices: string[];
  sources: string[];
}

export interface ServiceStatus {
  id: string;
  name: string;
  category: 'core' | 'taxation' | 'social-services' | 'health' | 'parliament' | 'other';
  status: 'operational' | 'degraded' | 'outage' | 'unknown';
  lastChecked?: Date;
  uptime?: number;
  url?: string;
  statusPageUrl?: string;
}

// Historical incidents (1975 onwards)
export const historicalIncidents: GovernmentIncident[] = [
  {
    name: "1975 Australian Constitutional Crisis",
    startDate: new Date(1975, 9, 15), // October 15, 1975
    endDate: new Date(1975, 10, 11),  // November 11, 1975
    duration: 27,
    type: 'constitutional-crisis',
    severity: 'critical',
    description: "The Governor-General dismissed Prime Minister Gough Whitlam after the Opposition-controlled Senate blocked supply (budget bills). While this created a constitutional crisis, essential government services continued to operate. The crisis was resolved when caretaker PM Malcolm Fraser was appointed and elections were called.",
    affectedServices: [
      "Parliamentary operations (supply blocked)",
      "Political uncertainty",
      "Reduced government decision-making capacity"
    ],
    sources: [
      "https://www.aph.gov.au/About_Parliament/Senate/Practice_and_Procedure/platparl/c04",
      "https://peo.gov.au/understand-our-parliament/your-questions-on-notice/questions/what-happens-when-a-supply-bill-is-blocked-why-was-supply-blocked-in-1975"
    ]
  },
  {
    name: "MyGov System Outage",
    startDate: new Date(2021, 5, 1), // June 1, 2021
    endDate: new Date(2021, 5, 2),   // June 2, 2021
    duration: 1,
    type: 'service-outage',
    severity: 'major',
    description: "Major outage affecting myGov portal, preventing access to Centrelink, Medicare, and ATO services for millions of Australians.",
    affectedServices: [
      "myGov portal",
      "Centrelink online services",
      "Medicare online services",
      "ATO online services"
    ],
    sources: [
      "https://www.abc.net.au/news/2021-06-01/mygov-website-down-outage/100183456"
    ]
  },
  {
    name: "Census Website Failure",
    startDate: new Date(2016, 7, 9),  // August 9, 2016
    endDate: new Date(2016, 7, 11),   // August 11, 2016
    duration: 2,
    type: 'service-outage',
    severity: 'major',
    description: "The Australian Bureau of Statistics (ABS) census website crashed on census night due to DDoS attacks and infrastructure issues, preventing millions from completing the census online.",
    affectedServices: [
      "ABS Census website",
      "Census data collection"
    ],
    sources: [
      "https://www.abc.net.au/news/2016-08-10/census-website-crashes-on-census-night/7716990"
    ]
  },
  {
    name: "Medicare Outage",
    startDate: new Date(2022, 2, 14), // March 14, 2022
    endDate: new Date(2022, 2, 15),   // March 15, 2022
    duration: 1,
    type: 'service-outage',
    severity: 'major',
    description: "Medicare's payment systems experienced widespread outages affecting GP clinics and pharmacies across Australia.",
    affectedServices: [
      "Medicare payment systems",
      "GP clinic billing",
      "Pharmacy claims"
    ],
    sources: [
      "https://www.9news.com.au/national/medicare-outage-payment-systems-down/93c5e0a0-a3b5-11ec-b9c5-c8f6b6a3c5e0"
    ]
  }
];

// Current services to monitor
export const monitoredServices: ServiceStatus[] = [
  {
    id: 'mygov',
    name: 'myGov',
    category: 'core',
    status: 'operational',
    url: 'https://my.gov.au',
    statusPageUrl: 'https://my.gov.au/systemstatus'
  },
  {
    id: 'ato',
    name: 'Australian Taxation Office',
    category: 'taxation',
    status: 'operational',
    url: 'https://www.ato.gov.au',
    statusPageUrl: 'https://www.ato.gov.au/About-ATO/About-us/System-status/'
  },
  {
    id: 'services-australia',
    name: 'Services Australia',
    category: 'social-services',
    status: 'operational',
    url: 'https://www.servicesaustralia.gov.au',
    statusPageUrl: 'https://www.servicesaustralia.gov.au/system-maintenance-and-outages'
  },
  {
    id: 'medicare',
    name: 'Medicare',
    category: 'health',
    status: 'operational',
    url: 'https://www.servicesaustralia.gov.au/medicare',
    statusPageUrl: 'https://www.servicesaustralia.gov.au/system-maintenance-and-outages'
  },
  {
    id: 'centrelink',
    name: 'Centrelink',
    category: 'social-services',
    status: 'operational',
    url: 'https://www.servicesaustralia.gov.au/centrelink',
    statusPageUrl: 'https://www.servicesaustralia.gov.au/system-maintenance-and-outages'
  },
  {
    id: 'parliament',
    name: 'Parliament of Australia',
    category: 'parliament',
    status: 'operational',
    url: 'https://www.aph.gov.au',
    statusPageUrl: 'https://www.aph.gov.au'
  },
  {
    id: 'abs',
    name: 'Australian Bureau of Statistics',
    category: 'other',
    status: 'operational',
    url: 'https://www.abs.gov.au'
  }
];

// Calculate uptime percentage from historical data
export function calculateUptime(startDate: Date, endDate: Date): {
  uptimePercentage: number;
  totalDays: number;
  downtimeDays: number;
} {
  const totalDays = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  // Calculate total downtime from incidents
  const downtimeDays = historicalIncidents
    .filter(incident => incident.startDate >= startDate && incident.startDate <= endDate)
    .reduce((total, incident) => {
      // Only count constitutional crisis as full downtime
      // Service outages are partial and don't count toward government "shutdown"
      if (incident.type === 'constitutional-crisis') {
        return total + incident.duration;
      }
      return total;
    }, 0);

  const uptimePercentage = ((totalDays - downtimeDays) / totalDays) * 100;

  return {
    uptimePercentage,
    totalDays,
    downtimeDays
  };
}

// Monthly data interface
export interface MonthData {
  year: number;
  month: number;
  monthName: string;
  fullMonthName: string;
  hasIncident: boolean;
  incidents: GovernmentIncident[];
  severity: 'critical' | 'warning' | 'normal';
}

// Generate monthly data for visualization
export function generateMonthlyData(startDate: Date, endDate: Date): MonthData[] {
  const months: MonthData[] = [];
  const current = new Date(startDate);

  while (current <= endDate) {
    const monthStart = new Date(current.getFullYear(), current.getMonth(), 1);
    const monthEnd = new Date(current.getFullYear(), current.getMonth() + 1, 0);

    // Check if this month has any incidents
    const incidents = historicalIncidents.filter(incident => {
      return (incident.startDate <= monthEnd && incident.endDate >= monthStart);
    });

    const hasConstitutionalCrisis = incidents.some(i => i.type === 'constitutional-crisis');
    const hasServiceOutage = incidents.some(i => i.type === 'service-outage');

    const severity: 'critical' | 'warning' | 'normal' = hasConstitutionalCrisis ? 'critical' : hasServiceOutage ? 'warning' : 'normal';

    months.push({
      year: current.getFullYear(),
      month: current.getMonth(),
      monthName: current.toLocaleDateString('en-AU', { month: 'short' }),
      fullMonthName: current.toLocaleDateString('en-AU', { month: 'long' }),
      hasIncident: incidents.length > 0,
      incidents: incidents,
      severity: severity
    });

    current.setMonth(current.getMonth() + 1);
  }

  return months;
}
