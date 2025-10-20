"use client";

import type { ServiceStatus as ServiceStatusType } from "@/lib/data";

interface ServiceStatusProps {
  services: ServiceStatusType[];
}

export function ServiceStatus({ services }: ServiceStatusProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'degraded':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'outage':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
        return '✓';
      case 'degraded':
        return '⚠';
      case 'outage':
        return '✗';
      default:
        return '?';
    }
  };

  const getCategoryName = (category: string) => {
    const names: Record<string, string> = {
      'core': 'Core Services',
      'taxation': 'Taxation',
      'social-services': 'Social Services',
      'health': 'Health',
      'parliament': 'Parliament',
      'other': 'Other'
    };
    return names[category] || category;
  };

  // Group services by category
  const groupedServices = services.reduce((acc, service) => {
    if (!acc[service.category]) {
      acc[service.category] = [];
    }
    acc[service.category].push(service);
    return acc;
  }, {} as Record<string, ServiceStatusType[]>);

  return (
    <div className="space-y-6">
      {Object.entries(groupedServices).map(([category, categoryServices]) => (
        <div key={category}>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            {getCategoryName(category)}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {categoryServices.map((service) => (
              <div
                key={service.id}
                className={`border rounded-lg p-4 ${getStatusColor(service.status)}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium">{service.name}</div>
                    {service.statusPageUrl && (
                      <a
                        href={service.statusPageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs hover:underline"
                      >
                        Status page →
                      </a>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">{getStatusIcon(service.status)}</span>
                    <span className="text-xs font-semibold uppercase">
                      {service.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
