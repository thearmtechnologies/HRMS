const API_URL = 'http://localhost:5000/api/attendance';

// Utility to get authorization header
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

// Helper to handle fetch responses and mimic Axios error format
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

export const checkIn = async (data = {}) => {
  const response = await fetch(`${API_URL}/check-in`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  return handleResponse(response);
};

export const checkOut = async (data = {}) => {
  const response = await fetch(`${API_URL}/check-out`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  return handleResponse(response);
};

export const getTodayAttendance = async () => {
  const response = await fetch(`${API_URL}/today`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

export const getMonthlyAttendance = async (month, year) => {
  const response = await fetch(`${API_URL}/monthly?month=${month}&year=${year}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

export const getAttendanceSummary = async (month, year) => {
  const response = await fetch(`${API_URL}/summary?month=${month}&year=${year}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

export const requestRegularization = async (data = {}) => {
  const response = await fetch(`${API_URL}/regularization/request`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  return handleResponse(response);
};

export const getRegularizationRequests = async () => {
  const response = await fetch(`${API_URL}/regularization`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

// Admin Endpoints
export const getAllAttendanceByDate = async (date) => {
  const response = await fetch(`${API_URL}/all/daily?date=${date}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

export const getAllRegularizationRequests = async () => {
  const response = await fetch(`${API_URL}/all/regularization`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

export const updateRegularizationStatus = async (id, status) => {
  const response = await fetch(`${API_URL}/regularization/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status })
  });
  return handleResponse(response);
};

const attendanceService = {
  checkIn,
  checkOut,
  getTodayAttendance,
  getMonthlyAttendance,
  getAttendanceSummary,
  requestRegularization,
  getRegularizationRequests,
  getAllAttendanceByDate,
  getAllRegularizationRequests,
  updateRegularizationStatus
};

export default attendanceService;
