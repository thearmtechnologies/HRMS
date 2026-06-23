const API_URL = 'http://localhost:5000/api/pay';

// Utility to get authorization header
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

// Helper to handle fetch responses
const handleResponse = async (response) => {
  if (!response.ok) {
    let errData;
    try {
      errData = await response.json();
    } catch {
      errData = { message: `HTTP Error ${response.status}` };
    }
    const error = new Error(errData.message || 'API Error');
    error.response = { data: errData };
    throw error;
  }
  return response.json();
};

// ============================================================
// DASHBOARD STATS
// ============================================================

export const getPayrollDashboardStats = async (month, year) => {
  const params = new URLSearchParams();
  if (month) params.append('month', month);
  if (year) params.append('year', year);
  const response = await fetch(`${API_URL}/dashboard-stats?${params}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

// ============================================================
// PAYROLL GENERATION & QUERIES
// ============================================================

export const generatePayroll = async (data) => {
  const response = await fetch(`${API_URL}/generate-payroll`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const getAllPayrolls = async (params = {}) => {
  const query = new URLSearchParams();
  if (params.month) query.append('month', params.month);
  if (params.year) query.append('year', params.year);
  if (params.employeeId) query.append('employeeId', params.employeeId);
  if (params.search) query.append('search', params.search);
  if (params.status) query.append('status', params.status);
  const response = await fetch(`${API_URL}/final-payroll?${query}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

export const getEmployeePayrollHistory = async (empId) => {
  const response = await fetch(`${API_URL}/employee-history/${empId}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

// ============================================================
// STATUS MANAGEMENT
// ============================================================

export const updatePayrollStatus = async (id, status) => {
  const response = await fetch(`${API_URL}/payroll/${id}/status`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status }),
  });
  return handleResponse(response);
};

export const bulkUpdatePayrollStatus = async (ids, status) => {
  const response = await fetch(`${API_URL}/payroll/bulk-status`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ ids, status }),
  });
  return handleResponse(response);
};

export const lockPayroll = async (id) => {
  const response = await fetch(`${API_URL}/payroll/${id}/lock`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

export const unlockPayroll = async (id) => {
  const response = await fetch(`${API_URL}/payroll/${id}/unlock`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

// ============================================================
// ADJUSTMENTS
// ============================================================

export const addAdjustment = async (id, adjustment) => {
  const response = await fetch(`${API_URL}/payroll/${id}/adjustment`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(adjustment),
  });
  return handleResponse(response);
};

export const removeAdjustment = async (payrollId, adjId) => {
  const response = await fetch(`${API_URL}/payroll/${payrollId}/adjustment/${adjId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

// ============================================================
// SALARY STRUCTURE
// ============================================================

export const getAllSalaryRecords = async () => {
  const response = await fetch(`${API_URL}/all-salary-records`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

export const getSalaryByEmployee = async (employeeId) => {
  const response = await fetch(`${API_URL}/salary-fixed/employee/${employeeId}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

export const createSalary = async (employeeId, data) => {
  const response = await fetch(`${API_URL}/salary-fixed/employee/${employeeId}`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ ...data, employeeId }),
  });
  return handleResponse(response);
};

export const updateSalary = async (employeeId, data) => {
  const response = await fetch(`${API_URL}/salary-fixed/employee/${employeeId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const getSalaryHistory = async (employeeId) => {
  const response = await fetch(`${API_URL}/salary-history/${employeeId}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

// ============================================================
// PDF & EMAIL
// ============================================================

export const downloadPayrollPdf = async (month, year, employeeId) => {
  const params = new URLSearchParams({ month, year });
  if (employeeId) params.append('employeeId', employeeId);

  const response = await fetch(`${API_URL}/pdf?${params}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({ message: 'Download failed' }));
    throw new Error(errData.message);
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;

  // Get filename from content-disposition header
  const disposition = response.headers.get('content-disposition');
  let filename = `payslip_${month}_${year}.pdf`;
  if (disposition) {
    const match = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
    if (match) filename = decodeURIComponent(match[1].replace(/['"]/g, ''));
  }

  // Check if it's a zip file
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('zip')) {
    filename = `payrolls_${month}_${year}.zip`;
  }

  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

export const emailPayslip = async (payrollId) => {
  const response = await fetch(`${API_URL}/payroll/${payrollId}/email`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

// ============================================================
// REPORTS & EXPORT
// ============================================================

export const getPayrollReports = async (params = {}) => {
  const query = new URLSearchParams();
  Object.keys(params).forEach(key => {
    if (params[key]) query.append(key, params[key]);
  });
  const response = await fetch(`${API_URL}/reports?${query}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

export const exportPayrollCSV = async (month, year) => {
  const params = new URLSearchParams();
  if (month) params.append('month', month);
  if (year) params.append('year', year);

  const response = await fetch(`${API_URL}/export/csv?${params}`, {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
  });

  if (!response.ok) throw new Error('CSV export failed');

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `payroll_${month || 'all'}_${year || 'all'}.csv`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

export const exportPayrollExcel = async (month, year) => {
  const params = new URLSearchParams();
  if (month) params.append('month', month);
  if (year) params.append('year', year);

  const response = await fetch(`${API_URL}/export/excel?${params}`, {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
  });

  if (!response.ok) throw new Error('Excel export failed');

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `payroll_${month || 'all'}_${year || 'all'}.xls`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

// ============================================================
// AUDIT LOGS
// ============================================================

export const getPayrollAuditLogs = async (params = {}) => {
  const query = new URLSearchParams();
  Object.keys(params).forEach(key => {
    if (params[key]) query.append(key, params[key]);
  });
  const response = await fetch(`${API_URL}/audit-logs?${query}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

// ============================================================
// TEMP CHANGES
// ============================================================

export const getTempEdits = async (month, year) => {
  const response = await fetch(`${API_URL}/get-edits?month=${month}&year=${year}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

export const saveTempEdit = async (data) => {
  const response = await fetch(`${API_URL}/post-edits`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const resetTempEdit = async (data) => {
  const response = await fetch(`${API_URL}/reset-edits`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

const payrollService = {
  getPayrollDashboardStats,
  generatePayroll,
  getAllPayrolls,
  getEmployeePayrollHistory,
  updatePayrollStatus,
  bulkUpdatePayrollStatus,
  lockPayroll,
  unlockPayroll,
  addAdjustment,
  removeAdjustment,
  getAllSalaryRecords,
  getSalaryByEmployee,
  createSalary,
  updateSalary,
  getSalaryHistory,
  downloadPayrollPdf,
  emailPayslip,
  getPayrollReports,
  exportPayrollCSV,
  exportPayrollExcel,
  getPayrollAuditLogs,
  getTempEdits,
  saveTempEdit,
  resetTempEdit,
};

export default payrollService;
