import { Route, Routes } from "react-router-dom";
import Auth from "./pages/Auth";
import AdminDashboard from "./pages/AdminDashboard";
import HRDashboard from "./pages/HRDashboard";
import Dashboard from "./pages/Dashboard";
import AttendanceManagement from "./pages/hr/AttendanceManagement";
import EmployeeManagement from "./pages/hr/EmployeeManagement";
import EmployeeProfile from "./pages/employee/EmployeeProfile";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Auth />} />
      <Route path="/admin-dashboard/*" element={<AdminDashboard />} />
      <Route path="/dashboard" element={<Dashboard />} />
      {/* HR Pages */}
      <Route path="/attendance" element={<AttendanceManagement />} />
      <Route path="/employee-management" element={<EmployeeManagement />} />

    {/* Employee Profile */}
      <Route path="/employee-profile" element={<EmployeeProfile />} />
      <Route path="/hr-dashboard/*" element={<HRDashboard />} />
    </Routes>
  );
}
