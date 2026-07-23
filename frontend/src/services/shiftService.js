const API_URL = 'http://localhost:5000/api/shift';

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

export const getShifts = async () => {
  const response = await fetch(`${API_URL}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

export const createShift = async (shiftData) => {
  const response = await fetch(`${API_URL}`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(shiftData),
  });
  return handleResponse(response);
};

export const updateShift = async (id, shiftData) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(shiftData),
  });
  return handleResponse(response);
};

export const deleteShift = async (id) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

export const assignShift = async (employeeId, shiftId) => {
  const response = await fetch(`${API_URL}/assign`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ employeeId, shiftId }),
  });
  return handleResponse(response);
};

export const getMyShift = async () => {
  const response = await fetch(`${API_URL}/my-shift`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

const shiftService = {
  getShifts,
  createShift,
  updateShift,
  deleteShift,
  assignShift,
  getMyShift
};

export default shiftService;
