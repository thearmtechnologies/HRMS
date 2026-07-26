import {
  User, Briefcase, IndianRupee, Calendar, Clock, ShieldCheck, History
} from 'lucide-react';

// Overview
import PersonalTab from './overview/PersonalTab';
import BankDetailsTab from './overview/BankDetailsTab';
import EmergencyTab from './overview/EmergencyTab';
import DocumentsTab from './overview/DocumentsTab';

// Employment
import EmploymentDetailsTab from './employment/EmploymentDetailsTab';
import OrganizationTab from './employment/OrganizationTab';
import ReportingTab from './employment/ReportingTab';

// Compensation
import SalaryAssignmentTab from './compensation/SalaryAssignmentTab';
import AllowancesTab from './compensation/AllowancesTab';
import DeductionsTab from './compensation/DeductionsTab';

// Attendance
import AttendanceSummaryTab from './attendance/AttendanceSummaryTab';
import AttendanceHistoryTab from './attendance/AttendanceHistoryTab';
import RegularizationTab from './attendance/RegularizationTab';

// Leave
import LeaveBalanceTab from './leave/LeaveBalanceTab';
import LeaveHistoryTab from './leave/LeaveHistoryTab';

// Permissions
import RolePermissionsTab from './permissions/RolePermissionsTab';
import OverridesTab from './permissions/OverridesTab';

// Timeline
import TimelineTab from './permissions/TimelineTab';

export const EMPLOYEE_PROFILE_TABS = [
  {
    id: 'overview',
    label: 'Overview',
    icon: User,
    subTabs: [
      { id: 'personal', label: 'Personal', component: PersonalTab },
      { id: 'bank', label: 'Bank Details', component: BankDetailsTab },
      { id: 'emergency', label: 'Emergency Contacts', component: EmergencyTab },
      { id: 'documents', label: 'Documents', component: DocumentsTab },
    ]
  },
  {
    id: 'employment',
    label: 'Employment',
    icon: Briefcase,
    subTabs: [
      { id: 'details', label: 'Employment Details', component: EmploymentDetailsTab },
      { id: 'organization', label: 'Organization', component: OrganizationTab },
      { id: 'reporting', label: 'Reporting Structure', component: ReportingTab },
    ]
  },
  {
    id: 'compensation',
    label: 'Compensation',
    icon: IndianRupee,
    subTabs: [
      { id: 'salary', label: 'Salary Assignment', component: SalaryAssignmentTab },
      { id: 'allowances', label: 'Allowances', component: AllowancesTab },
      { id: 'deductions', label: 'Deductions', component: DeductionsTab },
    ]
  },
  {
    id: 'attendance',
    label: 'Attendance',
    icon: Clock,
    subTabs: [
      { id: 'summary', label: 'Attendance Summary', component: AttendanceSummaryTab },
      { id: 'history', label: 'Attendance History', component: AttendanceHistoryTab },
      { id: 'regularization', label: 'Regularization', component: RegularizationTab },
    ]
  },
  {
    id: 'leave',
    label: 'Leave',
    icon: Calendar,
    subTabs: [
      { id: 'balance', label: 'Leave Balance', component: LeaveBalanceTab },
      { id: 'history', label: 'Leave History', component: LeaveHistoryTab },
    ]
  },
  {
    id: 'permissions',
    label: 'Permissions',
    icon: ShieldCheck,
    subTabs: [
      { id: 'role', label: 'Role Permissions', component: RolePermissionsTab },
      { id: 'overrides', label: 'Individual Overrides', component: OverridesTab },
    ]
  },
  {
    id: 'timeline',
    label: 'Timeline',
    icon: History,
    subTabs: [
      { id: 'activity', label: 'Activity Timeline', component: TimelineTab },
    ]
  },
];
