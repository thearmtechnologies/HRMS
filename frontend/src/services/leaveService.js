const API_URL = 'http://localhost:5000/api/leave';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

const handleResponse = async (response) => {
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const errorMsg = (data && data.error) ? data.error : 'Something went wrong';
    throw new Error(errorMsg);
  }
  return data;
};

const leaveService = {
  // Employee Routes
  getMyBalances: async () => {
    const response = await fetch(`${API_URL}/my-balances`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },
  
  getMyHistory: async () => {
    const response = await fetch(`${API_URL}/my-history`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  applyLeave: async (leaveData) => {
    const response = await fetch(`${API_URL}/apply`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(leaveData)
    });
    return handleResponse(response);
  },

  cancelLeave: async (id) => {
    const response = await fetch(`${API_URL}/cancel/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({})
    });
    return handleResponse(response);
  },

  // HR / Admin Routes
  getAllLeaveRequests: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status && filters.status !== 'All') params.append('status', filters.status);
    if (filters.leaveType && filters.leaveType !== 'All') params.append('leaveType', filters.leaveType);
    
    const response = await fetch(`${API_URL}/all?${params.toString()}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  getDashboardStats: async () => {
    const response = await fetch(`${API_URL}/stats`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  updateLeaveStatus: async (id, status, remarks, reason) => {
    const response = await fetch(`${API_URL}/status/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status, remarks, reason })
    });
    return handleResponse(response);
  },

  manualLeaveEntry: async (entryData) => {
    const response = await fetch(`${API_URL}/manual-entry`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(entryData)
    });
    return handleResponse(response);
  },

  adjustBalance: async (adjustmentData) => {
    const response = await fetch(`${API_URL}/adjust-balance`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(adjustmentData)
    });
    return handleResponse(response);
  },

  getEmployeeBalances: async (employeeId) => {
    const response = await fetch(`${API_URL}/balances/${employeeId}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  }
};

export default leaveService;
