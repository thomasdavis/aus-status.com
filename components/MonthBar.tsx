"use client";

import { useState } from "react";
import type { GovernmentIncident } from "@/lib/data";

interface MonthBarProps {
  year: number;
  monthName: string;
  fullMonthName: string;
  hasIncident: boolean;
  incidents: GovernmentIncident[];
  severity: 'critical' | 'warning' | 'normal';
}

export function MonthBar({ year, monthName, fullMonthName, hasIncident, incidents, severity }: MonthBarProps) {
  const [isHovered, setIsHovered] = useState(false);

  const getBarColor = () => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500';
      case 'warning':
        return 'bg-yellow-500';
      default:
        return 'bg-green-500';
    }
  };

  return (
    <div
      className={`flex-1 h-5 ${getBarColor()} opacity-80 hover:opacity-100 transition-opacity cursor-pointer relative`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isHovered && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50 pointer-events-none">
          <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap max-w-xs">
            <div className="font-semibold">{fullMonthName} {year}</div>
            {hasIncident ? (
              <div className="mt-1 space-y-1">
                {incidents.map((incident, idx) => (
                  <div key={idx} className="text-left">
                    <div className="font-medium">{incident.name}</div>
                    <div className="text-gray-300">{incident.duration} day{incident.duration !== 1 ? 's' : ''}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-300">No disruptions</div>
            )}
          </div>
          <div className="absolute left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  );
}
