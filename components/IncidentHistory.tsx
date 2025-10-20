"use client";

import type { GovernmentIncident } from "@/lib/data";

interface IncidentHistoryProps {
  incidents: GovernmentIncident[];
}

export function IncidentHistory({ incidents }: IncidentHistoryProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'border-red-500 bg-red-50';
      case 'major':
        return 'border-orange-500 bg-orange-50';
      case 'minor':
        return 'border-yellow-500 bg-yellow-50';
      default:
        return 'border-gray-500 bg-gray-50';
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'major':
        return 'bg-orange-100 text-orange-800';
      case 'minor':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'constitutional-crisis': 'Constitutional Crisis',
      'partial-disruption': 'Partial Disruption',
      'service-outage': 'Service Outage',
      'funding-delay': 'Funding Delay'
    };
    return labels[type] || type;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-4">
      {incidents.map((incident, idx) => (
        <div
          key={idx}
          className={`border-l-4 rounded-r-lg p-4 ${getSeverityColor(incident.severity)}`}
        >
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-semibold text-gray-900">{incident.name}</h3>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`text-xs px-2 py-1 rounded font-medium ${getSeverityBadge(incident.severity)}`}>
                  {incident.severity.toUpperCase()}
                </span>
                <span className="text-xs px-2 py-1 rounded font-medium bg-gray-100 text-gray-800">
                  {getTypeLabel(incident.type)}
                </span>
              </div>
            </div>
            <div className="text-right text-sm text-gray-600">
              <div className="font-medium">{incident.duration} day{incident.duration !== 1 ? 's' : ''}</div>
              <div className="text-xs">{formatDate(incident.startDate)}</div>
              {incident.duration > 1 && (
                <div className="text-xs">to {formatDate(incident.endDate)}</div>
              )}
            </div>
          </div>

          <p className="text-sm text-gray-700 mb-3">
            {incident.description}
          </p>

          {incident.affectedServices.length > 0 && (
            <div className="mb-3">
              <div className="text-xs font-semibold text-gray-600 mb-1">Affected Services:</div>
              <ul className="text-xs text-gray-600 list-disc list-inside space-y-1">
                {incident.affectedServices.map((service, serviceIdx) => (
                  <li key={serviceIdx}>{service}</li>
                ))}
              </ul>
            </div>
          )}

          {incident.sources.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-gray-600 mb-1">Sources:</div>
              <div className="space-y-1">
                {incident.sources.map((source, sourceIdx) => (
                  <a
                    key={sourceIdx}
                    href={source}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline block truncate"
                  >
                    {source}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
