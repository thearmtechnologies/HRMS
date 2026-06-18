const API_URL = 'http://localhost:5000/api/verification';

export const getPendingVerifications = async (token) => {
  const response = await fetch(`${API_URL}/pending`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!response.ok) throw new Error('Failed to fetch');
  return response.json();
};

export const getVerifiedRecords = async (token) => {
  const response = await fetch(`${API_URL}/verified`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!response.ok) throw new Error('Failed to fetch');
  return response.json();
};

export const getRejectedRecords = async (token) => {
  const response = await fetch(`${API_URL}/rejected`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!response.ok) throw new Error('Failed to fetch');
  return response.json();
};

export const verifyDocument = async (id, documentType, token) => {
  const response = await fetch(`${API_URL}/${id}/verify`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}` 
    },
    body: JSON.stringify({ documentType })
  });
  if (!response.ok) throw new Error('Failed to verify');
  return response.json();
};

export const rejectDocument = async (id, documentType, remarks, token) => {
  const response = await fetch(`${API_URL}/${id}/reject`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}` 
    },
    body: JSON.stringify({ documentType, remarks })
  });
  if (!response.ok) throw new Error('Failed to reject');
  return response.json();
};
