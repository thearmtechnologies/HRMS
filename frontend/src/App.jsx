import { Route, Routes } from "react-router-dom";
import Auth from "./pages/Auth";
import HRDashboard from "./pages/HRDashboard";
import AttendanceManagement from "./pages/hr/AttendanceManagement";
import EmployeeManagement from "./pages/hr/EmployeeManagement";
import EmployeeProfile from "./pages/employee/EmployeeProfile";
import FinanceDashboard from "./pages/finance/FinanceDashboard";
import PayrollManagement from "./pages/finance/PayrollManagement";
import AdminDashboard from "./pages/admin/AdminDashboard";

export default function App() {
  return (
    <Routes>
      {/* Admin Pages */}
      <Route path="/admin-dashboard/*" element={<AdminDashboard />} />

      <Route path="/" element={<Auth />} />
      {/* HR Pages */}
      <Route path="/attendance" element={<AttendanceManagement />} />
      <Route path="/employee-management" element={<EmployeeManagement />} />

      {/* Employee Profile */}
      <Route path="/employee-profile" element={<EmployeeProfile />} />
      <Route path="/hr-dashboard/*" element={<HRDashboard />} />

      {/* finance */}
      <Route path="/finance-dashboard/*" element={<FinanceDashboard />} />
      <Route path="/payroll" element={<PayrollManagement />} />
    </Routes>
  );
}
