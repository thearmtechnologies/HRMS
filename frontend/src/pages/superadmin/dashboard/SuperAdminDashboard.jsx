import React from 'react';
import SuperAdminLayout from '../components/SuperAdminLayout';
import CompanyManagement from '../companies/CompanyManagement';

export default function SuperAdminDashboard() {
  return (
    <SuperAdminLayout>
      <CompanyManagement />
    </SuperAdminLayout>
  );
}
