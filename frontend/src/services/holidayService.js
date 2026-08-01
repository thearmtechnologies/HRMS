const API_URL = 'http://localhost:5000/api/holidays';

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
    error.response = { data: errData, status: response.status };
    throw error;
  }
  return response.json();
};

// ============================================================
// READ
// ============================================================

export const getHolidaysByYear = async (year, includeArchived = false) => {
  const response = await fetch(`${API_URL}/${year}?includeArchived=${includeArchived}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

export const getAllYears = async () => {
  const response = await fetch(`${API_URL}/all-years`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

// ============================================================
// CREATE
// ============================================================

export const createYearConfig = async (year) => {
  const response = await fetch(`${API_URL}/init-year`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ year }),
  });
  return handleResponse(response);
};

export const addHoliday = async (data, year = null) => {
  const url = year ? `${API_URL}/${year}/holiday` : `${API_URL}/`;
  const response = await fetch(url, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

// ============================================================
// UPDATE
// ============================================================

export const updateHoliday = async (holidayId, data, year = null) => {
  const url = year ? `${API_URL}/${year}/holiday/${holidayId}` : `${API_URL}/holiday/${holidayId}`;
  const response = await fetch(url, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const reactivateHoliday = async (holidayId, year = null) => {
  const url = year ? `${API_URL}/${year}/holiday/${holidayId}/reactivate` : `${API_URL}/holiday/${holidayId}/reactivate`;
  const response = await fetch(url, {
    method: 'PUT',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

export const updateMonthHolidays = async (year, month, holidays) => {
  const response = await fetch(`${API_URL}/${year}/month`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ month, holidays }),
  });
  return handleResponse(response);
};

// ============================================================
// DELETE / ARCHIVE
// ============================================================

export const deleteHoliday = async (holidayId, deleteScope = 'entire_series', year = null) => {
  const baseUrl = year ? `${API_URL}/${year}/holiday/${holidayId}` : `${API_URL}/holiday/${holidayId}`;
  const url = `${baseUrl}?deleteScope=${encodeURIComponent(deleteScope)}`;
  const response = await fetch(url, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

// ============================================================
// Default export
// ============================================================

const holidayService = {
  getHolidaysByYear,
  getAllYears,
  createYearConfig,
  addHoliday,
  updateHoliday,
  reactivateHoliday,
  updateMonthHolidays,
  deleteHoliday
};

export default holidayService;
