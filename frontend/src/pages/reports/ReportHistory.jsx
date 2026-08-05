import React from 'react';
import ReportsHeader from './components/layout/ReportsHeader';
import ReportBreadcrumb from './components/layout/ReportBreadcrumb';
import RecentReports from './components/tables/RecentReports';

export default function ReportHistory() {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <ReportBreadcrumb items={[{ label: 'Report History' }]} />
      <ReportsHeader 
        title="Report History" 
        description="View and download previously generated reports"
      />
      <div className="bg-white rounded-xl shadow-sm">
        <RecentReports />
      </div>
    </div>
  );
}
