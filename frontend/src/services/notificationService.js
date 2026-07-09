const API_URL = 'http://localhost:5000/api/notifications';

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
    } catch {
      errData = { message: `HTTP Error ${response.status}` };
    }
    const error = new Error(errData.message || 'API Error');
    error.response = { data: errData };
    throw error;
  }
  return response.json();
};

export const getMyNotifications = async (limit = 50) => {
  const res = await fetch(`${API_URL}?limit=${limit}`, {
    method: 'GET',
    headers: getAuthHeaders()
  });
  return handleResponse(res);
};

export const getUnreadCount = async () => {
  const res = await fetch(`${API_URL}/unread/count`, {
    method: 'GET',
    headers: getAuthHeaders()
  });
  return handleResponse(res);
};

export const markAsRead = async (id) => {
  const res = await fetch(`${API_URL}/${id}/read`, {
    method: 'PATCH',
    headers: getAuthHeaders()
  });
  return handleResponse(res);
};

export const markAllAsRead = async () => {
  const res = await fetch(`${API_URL}/read-all`, {
    method: 'PATCH',
    headers: getAuthHeaders()
  });
  return handleResponse(res);
};

export const deleteNotification = async (id) => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  return handleResponse(res);
};

export default {
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification
};
