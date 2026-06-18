import {
  Building2,
  CalendarCheck,
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
  { name: "Dashboard", id: "dashboard", icon: LayoutDashboard, roles: ['admin', 'hr', 'employee'] },
  { name: "Virtual ID", id: "virtual-id", icon: User, path: "/virtual-id", roles: ['admin', 'hr', 'employee'] },
  { name: "Employees", id: "employees", icon: Users, roles: ['admin', 'hr'] },
  { name: "Verification Center", id: "verification-center", icon: ClipboardCheck, path: "/hr/verification-center", roles: ['admin', 'hr'] },
  { name: "Attendance", id: "attendance", icon: CalendarCheck, roles: ['admin', 'hr', 'employee'] },
  { name: "Leave Requests", id: "leave-requests", icon: Clock, roles: ['admin', 'hr'] },
  { name: "My Leaves", id: "my-leaves", icon: Clock, roles: ['employee'] },
  { name: "Payroll", id: "payroll", icon: Wallet, roles: ['admin', 'hr', 'employee'] },
  { name: "Departments", id: "departments", icon: Building2, roles: ['admin'] },
  { name: "Projects", id: "projects", icon: FolderKanban, roles: ['admin', 'employee'] },
  { name: "Documents", id: "documents", icon: FileText, roles: ['employee'] },
  { name: "Announcements", id: "announcements", icon: Bell, roles: ['employee'] },
  { name: "Settings", id: "settings", icon: Settings, roles: ['admin', 'hr', 'employee'] },
];

export const getDashboardPath = (role) => {
  switch(role) {
    case 'admin': return '/admin-dashboard';
    case 'hr': return '/hr-dashboard';
    case 'employee': return '/employee-dashboard';
    default: return '/';
  }
};
