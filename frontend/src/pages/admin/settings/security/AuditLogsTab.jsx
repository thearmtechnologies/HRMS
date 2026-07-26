import React, { useState, useEffect, useContext } from 'react';
import SettingsCard from '../components/SettingsCard';
import SettingsHeader from '../components/SettingsHeader';
import { AuthContext } from '../../../../context/AuthContext';

export default function AuditLogsTab() {
  const { token } = useContext(AuthContext);
  const [auditLogs, setAuditLogs] = useState([]);

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const fetchAuditLogs = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/settings/audit-logs', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setAuditLogs(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <SettingsCard>
      <SettingsHeader 
        title="Security Audit Logs" 
        description="Track changes made to roles, permissions, and designations."
      />
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-[#f0f3f5]">
            <tr>
              <th className="px-5 py-4 text-xs font-bold text-[#8f9192] uppercase tracking-wider border-b border-[#d6d9df]">Timestamp</th>
              <th className="px-5 py-4 text-xs font-bold text-[#8f9192] uppercase tracking-wider border-b border-[#d6d9df]">Action</th>
              <th className="px-5 py-4 text-xs font-bold text-[#8f9192] uppercase tracking-wider border-b border-[#d6d9df]">Changed By</th>
              <th className="px-5 py-4 text-xs font-bold text-[#8f9192] uppercase tracking-wider border-b border-[#d6d9df]">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#d6d9df]">
            {auditLogs.length === 0 ? (
              <tr><td colSpan="4" className="p-8 text-center text-[#8f9192]">No audit logs found.</td></tr>
            ) : auditLogs.map(log => (
              <tr key={log._id} className="hover:bg-[#f8f9fa]">
                <td className="px-5 py-3 text-sm text-[#8f9192] whitespace-nowrap">{new Date(log.createdAt).toLocaleString()}</td>
                <td className="px-5 py-3 text-sm font-semibold text-[#1E293B]"><span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">{log.action}</span></td>
                <td className="px-5 py-3 text-sm font-medium text-[#1E293B]">{log.changedBy ? `${log.changedBy.firstName} ${log.changedBy.lastName}` : 'System'}</td>
                <td className="px-5 py-3 text-sm text-[#64748B]">{log.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SettingsCard>
  );
}
