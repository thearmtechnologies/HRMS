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

export const getMyShift = async () => {
  const response = await fetch(`${API_URL}/my-shift`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

const shiftService = {
  getMyShift
};

export default shiftService;
