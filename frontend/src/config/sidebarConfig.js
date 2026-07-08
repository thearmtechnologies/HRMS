import {
  Building2,
  CalendarCheck,
  CalendarDays,
  Clock,
  FolderKanban,
  LayoutDashboard,
  Settings,
  Users,
  Wallet,
  ClipboardCheck,
  FileText,
  Bell,
  User,
} from "lucide-react";

export const ALL_MENU_ITEMS = [
  { name: "Dashboard", id: "dashboard", icon: LayoutDashboard, permissionModule: 'dashboard' },
  { name: "Virtual ID", id: "virtual-id", icon: User, path: "/virtual-id", permissionModule: 'virtual_id' },
  { name: "Employees", id: "employees", icon: Users, permissionModule: 'employee_management' },
  { name: "Verification Center", id: "verification-center", icon: ClipboardCheck, path: "/hr/verification-center", permissionModule: 'verification_center' },
  { name: "My Attendance", id: "attendance", icon: CalendarCheck, permissionModule: 'attendance' },
  { name: "Team Attendance", id: "team-attendance", icon: CalendarCheck, permissionModule: 'team_attendance' },
  { name: "Leave Requests", id: "leave-requests", icon: Clock, permissionModule: 'leave_management' },
  { name: "My Leaves", id: "my-leaves", icon: Clock, permissionModule: 'leave_management' }, // Can be filtered differently if needed
  { name: "Payroll", id: "payroll", icon: Wallet, permissionModule: 'payroll' },
  { name: "Departments", id: "departments", icon: Building2, permissionModule: 'departments' },
  { name: "Projects", id: "projects", icon: FolderKanban, permissionModule: 'projects' },
  { name: "Holidays", id: "holidays", icon: CalendarDays, permissionModule: 'holiday_management' },
  { name: "Documents", id: "documents", icon: FileText, permissionModule: 'employee_profile' }, // Just mapped to profile for now
  { name: "Announcements", id: "announcements", icon: Bell, permissionModule: 'dashboard' }, // Assuming dash
  { name: "Settings", id: "settings", icon: Settings, permissionModule: 'settings' },
];

export const getDashboardPath = (role) => {
  switch(role) {
    case 'admin': return '/admin-dashboard';
    case 'hr': return '/hr-dashboard';
    case 'employee': return '/employee-dashboard';
    default: return '/';
  }
};
