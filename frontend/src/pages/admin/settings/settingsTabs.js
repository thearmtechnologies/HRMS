import { Building2, ShieldCheck, Clock, CalendarDays, Wallet, Lock, Settings as SystemIcon, Users } from 'lucide-react';
import React from 'react';

// General
import CompanyInformationTab from './general/CompanyInformationTab';

// Payroll
import PayrollSettingsTab from './payroll/PayrollSettingsTab';
import SalaryRulesTab from './payroll/SalaryRulesTab';
import TaxSettingsTab from './payroll/TaxSettingsTab';

// Organization
import DesignationsTab from './organization/DesignationsTab';

// People
import RolesPermissionsTab from './people/RolesPermissionsTab';

// Attendance
import ShiftManagementTab from './attendance/ShiftManagementTab';

// Leave
import LeaveManagementTab from './leave/LeaveManagementTab';

// Security
import AuditLogsTab from './security/AuditLogsTab';

// Placeholder Component
import PlaceholderTab from './components/PlaceholderTab';

const P = (title) => () => React.createElement(PlaceholderTab, { title });

export const SETTINGS_TABS = [
  {
    id: 'general',
    label: 'General',
    icon: Building2,
    subTabs: [
      { id: 'company', label: 'Company Information', component: CompanyInformationTab },
      { id: 'branding', label: 'Branding', component: P('Branding') },
      { id: 'localization', label: 'Localization', component: P('Localization') },
    ]
  },
  {
    id: 'organization',
    label: 'Organization',
    icon: Users,
    subTabs: [
      { id: 'designations', label: 'Designations', component: DesignationsTab },
      { id: 'departments', label: 'Departments', component: P('Departments') },
      { id: 'working-locations', label: 'Working Locations', component: P('Working Locations') },
    ]
  },
  {
    id: 'people',
    label: 'People',
    icon: ShieldCheck,
    subTabs: [
      { id: 'roles', label: 'Roles & Permissions', component: RolesPermissionsTab },
      { id: 'approval-workflow', label: 'Approval Workflow', component: P('Approval Workflow') },
    ]
  },
  {
    id: 'attendance',
    label: 'Attendance',
    icon: Clock,
    subTabs: [
      { id: 'shifts', label: 'Shift Management', component: ShiftManagementTab },
      { id: 'attendance-rules', label: 'Attendance Rules', component: P('Attendance Rules') },
      { id: 'holidays', label: 'Holidays', component: P('Holidays') },
    ]
  },
  {
    id: 'leave',
    label: 'Leave',
    icon: CalendarDays,
    subTabs: [
      { id: 'leave-management', label: 'Leave Management', component: LeaveManagementTab },
      { id: 'leave-policies', label: 'Leave Policies', component: P('Leave Policies') },
    ]
  },
  {
    id: 'payroll',
    label: 'Payroll',
    icon: Wallet,
    subTabs: [
      { id: 'payroll-settings', label: 'Payroll Settings', component: PayrollSettingsTab },
      { id: 'salary-rules', label: 'Salary Rules', component: SalaryRulesTab },
      { id: 'tax-settings', label: 'Tax Settings', component: TaxSettingsTab },
    ]
  },
  {
    id: 'security',
    label: 'Security',
    icon: Lock,
    subTabs: [
      { id: 'audit-logs', label: 'Audit Logs', component: AuditLogsTab },
      { id: 'login-policies', label: 'Login Policies', component: P('Login Policies') },
    ]
  },
  {
    id: 'system',
    label: 'System',
    icon: SystemIcon,
    subTabs: [
      { id: 'notifications', label: 'Notifications', component: P('Notifications') },
      { id: 'email-settings', label: 'Email Settings', component: P('Email Settings') },
      { id: 'integrations', label: 'Integrations', component: P('Integrations') },
    ]
  }
];
