// frontend/src/services/announcementService.js

const API_URL = 'http://localhost:5000/api/announcements';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  if (token) {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  }
  return { 'Content-Type': 'application/json' };
};

const announcementService = {
  getAllAnnouncements: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const url = queryParams ? `${API_URL}?${queryParams}` : API_URL;
    const response = await fetch(url, { headers: getHeaders() });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to fetch announcements');
    return data.announcements;
  },

  getMyAnnouncements: async () => {
    const response = await fetch(`${API_URL}/my`, { headers: getHeaders() });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to fetch your announcements');
    return data.announcements;
  },

  createAnnouncement: async (announcementData) => {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(announcementData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to create announcement');
    return data.announcement;
  },

  updateAnnouncement: async (id, announcementData) => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(announcementData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to update announcement');
    return data.announcement;
  },

  deleteAnnouncement: async (id) => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to delete announcement');
    return data;
  }
};

export default announcementService;
