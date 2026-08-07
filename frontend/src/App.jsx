import { Route, Routes, Navigate } from "react-router-dom";
import Auth from "./pages/Auth";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyOtp from "./pages/VerifyOtp";
import ResetPassword from "./pages/ResetPassword";
import ChangePassword from "./pages/ChangePassword";
import Unauthorized from "./pages/Unauthorized";
import HRDashboard from "./pages/hr/HRDashboard";
import EmployeeManagement from "./pages/shared/EmployeeManagement";
import CreateEmployee from "./pages/shared/CreateEmployee";
import EmployeeProfile from "./pages/employee/EmployeeProfile";
import AdminEmployeeProfileContainer from "./pages/shared/employee-profile/EmployeeProfile";
import CompleteProfile from "./pages/employee/CompleteProfile";
import FinanceDashboard from "./pages/finance/FinanceDashboard";
import PayrollManagement from "./pages/finance/PayrollManagement";
import PayrollReview from "./pages/finance/PayrollReview";
import AdminDashboard from "./pages/admin/AdminDashboard";
import EmployeeDashboard from "./pages/employee/EmployeeDashboard";
import Template from "./pages/Template";
import ProtectedRoute from "./components/ProtectedRoute";
import VirtualID from "./pages/employee/VirtualID";
import SharedLayout from "./components/layout/SharedLayout";
import VerificationCenter from "./pages/hr/VerificationCenter";
import NotificationToast from "./components/layout/NotificationToast";
import SuperAdminDashboard from "./pages/superadmin/dashboard/SuperAdminDashboard";
import CreateCompany from "./pages/superadmin/companies/CreateCompany";
import CompanyDetails from "./pages/superadmin/companies/CompanyDetails";
import SuperAdminLayout from "./pages/superadmin/components/SuperAdminLayout";

// Reports Module Imports
import ReportsLayout from "./pages/reports/ReportsLayout";
import ReportsDashboard from "./pages/reports/ReportsDashboard";
import ReportHistory from "./pages/reports/ReportHistory";
import AttendanceReports from "./pages/reports/attendance/AttendanceReports";
import EmployeeReports from "./pages/reports/employees/EmployeeReports";
import LeaveReports from "./pages/reports/leave/LeaveReports";
import PayrollReports from "./pages/reports/payroll/PayrollReports";
import ProjectReports from "./pages/reports/projects/ProjectReports";
import DepartmentReports from "./pages/reports/departments/DepartmentReports";

export default function App() {
  return (
    <>
      <NotificationToast />
      <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Auth />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/verify-otp" element={<VerifyOtp />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/super-admin" element={<Navigate to="/super-admin/dashboard" replace />} />
      <Route path="/super-admin/dashboard" element={<SuperAdminDashboard />} />
      <Route path="/super-admin/companies/create" element={<SuperAdminLayout><CreateCompany /></SuperAdminLayout>} />
      <Route path="/super-admin/companies/:companyId" element={<SuperAdminLayout><CompanyDetails /></SuperAdminLayout>} />

      {/* Protected Route for forcing password change */}
      <Route element={<ProtectedRoute />}>
        <Route path="/change-password" element={<ChangePassword />} />
      </Route>

      {/* Admin Pages */}
      <Route element={<ProtectedRoute requiredModule="dashboard" />}>
        <Route path="/admin-dashboard/*" element={<AdminDashboard />} />
      </Route>


      {/* HR Pages */}
      <Route element={<ProtectedRoute requiredModule="dashboard" />}>
        <Route path="/hr-dashboard/*" element={<HRDashboard />} />
      </Route>
      <Route element={<ProtectedRoute requiredModule="employee_management" />}>
        <Route path="/employee-management" element={<EmployeeManagement />} />
        <Route path="/hrms/employees/create" element={<SharedLayout><CreateEmployee /></SharedLayout>} />
        <Route path="/hrms/employees/:id" element={<SharedLayout><AdminEmployeeProfileContainer /></SharedLayout>} />
      </Route>
      <Route element={<ProtectedRoute requiredModule="verification_center" />}>
        <Route path="/hr/verification-center" element={<SharedLayout><VerificationCenter /></SharedLayout>} />
      </Route>

      {/* Finance Pages */}
      <Route element={<ProtectedRoute requiredModule="dashboard" />}>
        <Route path="/finance-dashboard/*" element={<FinanceDashboard />} />
      </Route>
      <Route element={<ProtectedRoute requiredModule="payroll" />}>
        <Route path="/payroll" element={<PayrollManagement />} />
        <Route path="/payroll/review" element={<PayrollReview />} />
      </Route>

      {/* Reports Module */}
      <Route element={<ProtectedRoute requiredModule="reports" />}>
        <Route path="/reports" element={<SharedLayout><ReportsLayout /></SharedLayout>}>
          <Route index element={<ReportsDashboard />} />
          <Route path="history" element={<ReportHistory />} />
          <Route path="attendance" element={<AttendanceReports />} />
          <Route path="employees" element={<EmployeeReports />} />
          <Route path="leave" element={<LeaveReports />} />
          <Route path="payroll" element={<PayrollReports />} />
          <Route path="projects" element={<ProjectReports />} />
          <Route path="departments" element={<DepartmentReports />} />
        </Route>
      </Route>



      {/* All Authenticated Users */}
      <Route element={<ProtectedRoute />}>
        <Route path="/profile" element={<SharedLayout><EmployeeProfile /></SharedLayout>} />
        <Route path="/virtual-id" element={<SharedLayout><VirtualID /></SharedLayout>} />
        <Route path="/employee-profile" element={<SharedLayout><EmployeeProfile /></SharedLayout>} />
        <Route path="/employee-dashboard/*" element={<EmployeeDashboard />} />
        <Route path="/complete-profile" element={<SharedLayout><CompleteProfile /></SharedLayout>} />
        <Route path="/temp" element={<Template />} />
      </Route>

    </Routes>
    </>
  );
}
