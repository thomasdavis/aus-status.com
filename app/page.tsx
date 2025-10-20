"use client";

import { MonthBar } from "@/components/MonthBar";
import { ServiceStatus } from "@/components/ServiceStatus";
import { IncidentHistory } from "@/components/IncidentHistory";
import {
  generateMonthlyData,
  calculateUptime,
  historicalIncidents,
  monitoredServices
} from "@/lib/data";

export default function Home() {
  // Start from 1975 (constitutional crisis)
  const startDate = new Date(1975, 0, 1); // January 1, 1975
  const endDate = new Date();

  const months = generateMonthlyData(startDate, endDate);
  const { uptimePercentage, totalDays, downtimeDays } = calculateUptime(startDate, endDate);

  const yearsTracked = Math.floor((endDate.getFullYear() - startDate.getFullYear()));
  const hasCurrentIncident = false; // Update this with real-time monitoring

  // Sort incidents by date (most recent first)
  const sortedIncidents = [...historicalIncidents].sort((a, b) =>
    b.startDate.getTime() - a.startDate.getTime()
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🇦🇺 Australia Status
          </h1>
          <p className="text-xl text-gray-600 mb-3">
            Federal Government Uptime Monitor*
          </p>

          <div className={`inline-flex items-center px-6 py-4 rounded-lg text-lg font-semibold ${
            hasCurrentIncident
              ? 'bg-red-100 text-red-800'
              : 'bg-green-100 text-green-800'
          }`}>
            <span className={`w-3 h-3 rounded-full mr-2 ${
              hasCurrentIncident ? 'bg-red-500 animate-pulse' : 'bg-green-500'
            }`}></span>
            {hasCurrentIncident ? 'Service Disruption' : 'Government is Operational'}
          </div>

          <div className="mt-2">
            <p className="text-lg text-gray-700 mb-2">
              {downtimeDays > 0 ? (
                <>
                  <span className="text-red-600 font-semibold">{downtimeDays} days</span> of constitutional crisis in {yearsTracked} years
                </>
              ) : (
                `Operational for ${totalDays}+ days`
              )}
            </p>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {uptimePercentage.toFixed(6)}%
            </p>
            <p className="text-sm text-gray-500">
              Uptime since January 1975
            </p>
          </div>
        </div>

        {/* Historical Timeline */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-base font-medium text-gray-900">
                Australian Federal Government
              </span>
              <span className="text-sm font-medium text-green-600">
                Operational
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex space-x-px">
                {months.map((m, idx) => (
                  <MonthBar
                    key={idx}
                    year={m.year}
                    monthName={m.monthName}
                    fullMonthName={m.fullMonthName}
                    hasIncident={m.hasIncident}
                    incidents={m.incidents}
                    severity={m.severity}
                  />
                ))}
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Jan 1975</span>
                <span>{endDate.toLocaleDateString('en-AU', { month: 'short', year: 'numeric' })}</span>
              </div>
              <div className="flex items-center justify-center space-x-4 text-xs text-gray-600 pt-2">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-500 rounded mr-1"></div>
                  <span>Operational</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-yellow-500 rounded mr-1"></div>
                  <span>Service Outage</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-red-500 rounded mr-1"></div>
                  <span>Constitutional Crisis</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Current Service Status */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Current Service Status
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Real-time monitoring of critical government services
            </p>
          </div>
          <div className="px-6 py-4">
            <ServiceStatus services={monitoredServices} />
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-800">
                <strong>Note:</strong> Service statuses are currently static. In production, these would be
                updated in real-time by polling official status pages and performing health checks every 60 seconds.
              </p>
            </div>
          </div>
        </div>

        {/* Historical Incidents */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Historical Incidents
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Major disruptions and outages since 1975
            </p>
          </div>
          <div className="px-6 py-4">
            <IncidentHistory incidents={sortedIncidents} />
          </div>
        </div>

        {/* About Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              About This Monitor
            </h2>
          </div>
          <div className="px-6 py-4">
            <div className="space-y-4 text-sm text-gray-600">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  What is a government shutdown?
                </h3>
                <p>
                  In some countries like the United States, when Congress fails to pass funding legislation,
                  the federal government can enter a &quot;shutdown&quot; where non-essential services cease operation.
                  Federal employees may be furloughed, and many government functions halt until funding is restored.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Why is Australia different?
                </h3>
                <p>
                  Australia operates under a Westminster parliamentary system. Unlike the US system,
                  the Australian government cannot experience a shutdown in the same way. If the government
                  loses the confidence of Parliament or cannot pass supply (budget) bills, it typically
                  triggers either a change of government or a general election, but essential government
                  services continue to operate.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  The 1975 Constitutional Crisis
                </h3>
                <p>
                  The only major supply crisis in Australian history occurred in 1975 when the
                  Opposition-controlled Senate blocked supply bills. This led to Governor-General Sir John Kerr
                  dismissing Prime Minister Gough Whitlam on November 11, 1975. Malcolm Fraser was appointed
                  as caretaker Prime Minister, supply was passed, and elections were held. While this created
                  a constitutional crisis, essential government services continued to operate throughout.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Service Outages vs Government Shutdowns
                </h3>
                <p>
                  While Australia hasn&apos;t experienced government shutdowns, various government services have
                  experienced technical outages over the years (myGov, Census, Medicare, etc.). These are
                  tracked separately from political/constitutional disruptions and are shown in yellow on
                  the timeline above.
                </p>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Data Sources & Methodology
                </h3>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Historical data from Parliament of Australia and Parliamentary Education Office</li>
                  <li>Service outage data from ABC News, 9News, and official government announcements</li>
                  <li>Current service status from official status pages (when available)</li>
                  <li>All incidents are verified against multiple sources before being added</li>
                </ul>
              </div>

              <div className="text-xs text-gray-500 mt-4 pt-4 border-t border-gray-200">
                <p>
                  This site is inspired by{' '}
                  <a href="https://usa-status.com" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                    usa-status.com
                  </a>
                  {' '}and serves as an educational comparison of different governmental systems.
                </p>
                <p className="mt-2">
                  Want to contribute data or report an incident?{' '}
                  <a href="https://github.com" className="text-blue-600 hover:underline">
                    Open an issue on GitHub
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>

        <footer className="mt-8 text-center text-sm text-gray-500">
          <p>Data tracked since January 1975 • Updated continuously</p>
          <p className="text-xs mt-2">
            Constitutional crisis data: 27 days (Oct 15 - Nov 11, 1975) • Service outages: {historicalIncidents.filter(i => i.type === 'service-outage').reduce((sum, i) => sum + i.duration, 0)} days total
          </p>
        </footer>
      </div>
    </div>
  );
}
