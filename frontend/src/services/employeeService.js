const API_URL = 'http://localhost:5000/api/employee';
const BULK_API_URL = 'http://localhost:5000/api/employees';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

const handleResponse = async (response) => {
  if (!response.ok) {
    let errData;
    try {
      errData = await response.json();
    } catch (_e) {
      errData = { message: `HTTP Error ${response.status}` };
    }
    const error = new Error(errData.message || 'API Error');
    error.response = { data: errData };
    throw error;
  }
  return response.json();
};

const downloadBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

export const getEmployeeDataByEmail = async (emailOrId) => {
  // We use profile/me to get the current logged in user's profile
  const endpoint = emailOrId === 'me' ? '/profile/me' : `/${emailOrId}`;
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

export const getAllEmployees = async () => {
  const response = await fetch(`${API_URL}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

export const downloadEmployeeImportTemplate = async () => {
  const response = await fetch(`${BULK_API_URL}/import/template`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
  });

  if (!response.ok) throw new Error('Failed to download template');

  const blob = await response.blob();
  downloadBlob(blob, 'Employee_Import_Template.xlsx');
};

export const previewEmployeeImport = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('action', 'preview');

  const response = await fetch(`${BULK_API_URL}/import`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
    body: formData,
  });

  return handleResponse(response);
};

export const confirmEmployeeImport = async (file, sendCredentialsByEmail = true) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('action', 'confirm');
  formData.append('sendCredentialsByEmail', String(sendCredentialsByEmail));

  const response = await fetch(`${BULK_API_URL}/import`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
    body: formData,
  });

  return handleResponse(response);
};

const employeeService = {
  getEmployeeDataByEmail,
  getAllEmployees
};

export default employeeService;
