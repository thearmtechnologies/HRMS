import React, { useState, useEffect } from 'react';
import { X, Loader2, Users, Building2, User, CalendarCheck, AlertTriangle } from 'lucide-react';

const MONTHS = [
  { value: 1, label: 'January' }, { value: 2, label: 'February' },
  { value: 3, label: 'March' }, { value: 4, label: 'April' },
  { value: 5, label: 'May' }, { value: 6, label: 'June' },
  { value: 7, label: 'July' }, { value: 8, label: 'August' },
  { value: 9, label: 'September' }, { value: 10, label: 'October' },
  { value: 11, label: 'November' }, { value: 12, label: 'December' },
];

export default function GeneratePayrollModal({ isOpen, onClose, onGenerated }) {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [scope, setScope] = useState('all');
  const [employeeId, setEmployeeId] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchEmployeesAndDepartments();
      setResult(null);
      setError('');
    }
  }, [isOpen]);

  const fetchEmployeesAndDepartments = async () => {
    const token = localStorage.getItem('token');
    const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

    try {
      const [empRes, deptRes] = await Promise.all([
        fetch('http://localhost:5000/api/employee', { headers }),
        fetch('http://localhost:5000/api/department', { headers }),
      ]);

      if (empRes.ok) {
        const empData = await empRes.json();
        setEmployees(Array.isArray(empData) ? empData : empData.employees || []);
      }
      if (deptRes.ok) {
        const deptData = await deptRes.json();
        setDepartments(Array.isArray(deptData) ? deptData : []);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const token = localStorage.getItem('token');
      const body = { month, year, scope };
      if (scope === 'single' && employeeId) body.employeeId = employeeId;
      if (scope === 'department' && departmentId) body.departmentId = departmentId;

      const response = await fetch('http://localhost:5000/api/pay/generate-payroll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Failed to generate payroll');
      } else {
        setResult(data);
        if (onGenerated) onGenerated();
      }
    } catch (err) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const scopeOptions = [
    { value: 'all', label: 'All Employees', icon: Users, description: 'Generate payroll for entire company' },
    { value: 'department', label: 'By Department', icon: Building2, description: 'Generate for a specific department' },
    { value: 'single', label: 'Single Employee', icon: User, description: 'Generate for one employee' },
  ];

  const years = [];
  const currentYear = new Date().getFullYear();
  for (let y = currentYear - 2; y <= currentYear + 1; y++) years.push(y);

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-[#fdfdfe] rounded-2xl border border-[#d6d9df] shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-[#d6d9df]">
            <div>
              <h2 className="text-xl font-bold text-[#1E293B]">Generate Payroll</h2>
              <p className="text-sm text-[#8f9192] mt-1">Select period and scope to generate payroll</p>
            </div>
            <button onClick={onClose} className="p-2 text-[#8f9192] hover:text-[#1E293B] hover:bg-[#f0f3f5] rounded-lg transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6">

            {/* Month & Year */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#8f9192] mb-2">Month</label>
                <select
                  value={month}
                  onChange={(e) => setMonth(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-transparent rounded-xl text-sm font-medium text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6]"
                >
                  {MONTHS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#8f9192] mb-2">Year</label>
                <select
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-transparent rounded-xl text-sm font-medium text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6]"
                >
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>

            {/* Scope Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#8f9192] mb-3">Scope</label>
              <div className="space-y-2">
                {scopeOptions.map(opt => {
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setScope(opt.value)}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
                        scope === opt.value
                          ? 'bg-[#3B82F6]/5 border-[#3B82F6] ring-2 ring-[#3B82F6]/20'
                          : 'bg-[#fdfdfe] border-[#d6d9df] hover:bg-[#f0f3f5]'
                      }`}
                    >
                      <div className={`p-2.5 rounded-lg ${scope === opt.value ? 'bg-[#3B82F6]/10 text-[#3B82F6]' : 'bg-[#f0f3f5] text-[#8f9192]'}`}>
                        <Icon size={20} />
                      </div>
                      <div>
                        <p className={`text-sm font-bold ${scope === opt.value ? 'text-[#1E293B]' : 'text-[#8f9192]'}`}>
                          {opt.label}
                        </p>
                        <p className="text-xs text-[#bdc2c7]">{opt.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Department Selector */}
            {scope === 'department' && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#8f9192] mb-2">Department</label>
                <select
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-transparent rounded-xl text-sm font-medium text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6]"
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept._id} value={dept._id}>{dept.departmentName}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Employee Selector */}
            {scope === 'single' && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#8f9192] mb-2">Employee</label>
                <select
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-transparent rounded-xl text-sm font-medium text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6]"
                >
                  <option value="">Select Employee</option>
                  {employees.map(emp => (
                    <option key={emp._id} value={emp._id}>
                      {emp.employeeName || emp.fullName || `${emp.firstName || ''} ${emp.lastName || ''}`.trim()} ({emp.employeeId || emp.tradeId})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                <AlertTriangle size={18} className="text-red-500 mt-0.5 shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Result */}
            {result && (
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                  <CalendarCheck size={18} className="text-green-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-green-700">{result.message}</p>
                    <p className="text-xs text-green-600 mt-1">{result.generated?.length || 0} payrolls generated successfully</p>
                  </div>
                </div>

                {result.errors && result.errors.length > 0 && (
                  <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl">
                    <p className="text-xs font-bold uppercase text-orange-600 mb-2">Skipped ({result.errors.length})</p>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {result.errors.map((err, i) => (
                        <p key={i} className="text-xs text-orange-700">
                          <span className="font-medium">{err.name || err.employeeId}</span>: {err.error}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-[#d6d9df]">
            <button
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-semibold text-[#8f9192] hover:text-[#1E293B] hover:bg-[#f0f3f5] rounded-xl transition-colors"
            >
              {result ? 'Close' : 'Cancel'}
            </button>
            {!result && (
              <button
                onClick={handleGenerate}
                disabled={loading || (scope === 'single' && !employeeId) || (scope === 'department' && !departmentId)}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#3B82F6] text-white text-sm font-semibold rounded-xl shadow-sm hover:bg-[#2563EB] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                {loading ? 'Generating...' : 'Generate Payroll'}
              </button>
            )}
          </div>

        </div>
      </div>
    </>
  );
}
