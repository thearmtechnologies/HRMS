import { Route, Routes, Navigate } from "react-router-dom";
import Auth from "./pages/Auth";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyOtp from "./pages/VerifyOtp";
import ResetPassword from "./pages/ResetPassword";
import ChangePassword from "./pages/ChangePassword";
import Unauthorized from "./pages/Unauthorized";

import HRDashboard from "./pages/hr/HRDashboard";
import AttendanceManagement from "./pages/hr/AttendanceManagement";
import EmployeeManagement from "./pages/hr/EmployeeManagement";
import EmployeeProfile from "./pages/employee/EmployeeProfile";
import CompleteProfile from "./pages/employee/CompleteProfile";
import FinanceDashboard from "./pages/finance/FinanceDashboard";
import PayrollManagement from "./pages/finance/PayrollManagement";
import AdminDashboard from "./pages/admin/AdminDashboard";
import EmployeeDashboard from "./pages/employee/EmployeeDashboard";
import Template from "./pages/Template";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Auth />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/verify-otp" element={<VerifyOtp />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Protected Route for forcing password change */}
      <Route element={<ProtectedRoute />}>
        <Route path="/change-password" element={<ChangePassword />} />
      </Route>

      {/* Admin Pages */}
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route path="/admin-dashboard/*" element={<AdminDashboard />} />
      </Route>

      {/* HR Pages */}
      <Route element={<ProtectedRoute allowedRoles={['admin', 'hr']} />}>
        <Route path="/hr-dashboard/*" element={<HRDashboard />} />
        <Route path="/attendance" element={<AttendanceManagement />} />
        <Route path="/employee-management" element={<EmployeeManagement />} />
      </Route>

      {/* Finance Pages (No specific role in requirements, maybe admin?) */}
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route path="/finance-dashboard/*" element={<FinanceDashboard />} />
        <Route path="/payroll" element={<PayrollManagement />} />
      </Route>



      {/* All Authenticated Users */}
      <Route element={<ProtectedRoute />}>
        <Route path="/employee-profile" element={<EmployeeProfile />} />
        <Route path="/employee-dashboard/*" element={<EmployeeDashboard />} />
        <Route path="/complete-profile" element={<CompleteProfile />} />
        <Route path="/temp" element={<Template />} />
      </Route>

    </Routes>
  );
}
