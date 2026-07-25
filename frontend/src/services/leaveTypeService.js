const API_URL = 'http://localhost:5000/api/leave-types';

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
      errData = { error: `HTTP Error ${response.status}` };
    }
    const error = new Error(errData.error || errData.message || 'API Error');
    error.response = { data: errData };
    throw error;
  }
  return response.json();
};

const leaveTypeService = {
  getLeaveTypes: async (includeAll = false) => {
    const url = includeAll ? `${API_URL}?all=true` : API_URL;
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  createLeaveType: async (leaveTypeData) => {
    const response = await fetch(`${API_URL}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(leaveTypeData),
    });
    return handleResponse(response);
  },

  updateLeaveType: async (id, leaveTypeData) => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(leaveTypeData),
    });
    return handleResponse(response);
  },

  deleteLeaveType: async (id) => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  }
};

export default leaveTypeService;
