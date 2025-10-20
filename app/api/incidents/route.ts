import { NextResponse } from 'next/server';
import { historicalIncidents } from '@/lib/data';

// This endpoint returns all historical incidents
export async function GET() {
  // Sort by date (most recent first)
  const sortedIncidents = [...historicalIncidents].sort((a, b) =>
    b.startDate.getTime() - a.startDate.getTime()
  );

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    incidents: sortedIncidents,
    metadata: {
      total: sortedIncidents.length,
      constitutional_crises: sortedIncidents.filter(i => i.type === 'constitutional-crisis').length,
      service_outages: sortedIncidents.filter(i => i.type === 'service-outage').length,
    }
  });
}

// POST endpoint for submitting new incidents (admin only in production)
export async function POST(request: Request) {
  // In production, this would:
  // 1. Require authentication
  // 2. Validate incident data
  // 3. Store in database
  // 4. Send notifications to subscribers

  return NextResponse.json(
    { error: 'Admin authentication required' },
    { status: 401 }
  );
}
