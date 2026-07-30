const API_URL = 'http://localhost:5000/api/settings/payroll';

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
    throw new Error(errData.message || errData.error || 'Request failed');
  }
  return response.json();
};

export const payrollConfigService = {
  // -----------------------------------------
  // COMPONENTS
  // -----------------------------------------
  getAllComponents: async () => {
    const response = await fetch(`${API_URL}/components`, { headers: getAuthHeaders() });
    return handleResponse(response);
  },
  
  createComponent: async (componentData) => {
    const response = await fetch(`${API_URL}/components`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(componentData)
    });
    return handleResponse(response);
  },
  
  updateComponent: async (id, componentData) => {
    const response = await fetch(`${API_URL}/components/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(componentData)
    });
    return handleResponse(response);
  },
  
  deleteComponent: async (id) => {
    const response = await fetch(`${API_URL}/components/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // -----------------------------------------
  // TEMPLATES
  // -----------------------------------------
  getAllTemplates: async () => {
    const response = await fetch(`${API_URL}/templates`, { headers: getAuthHeaders() });
    return handleResponse(response);
  },
  
  createTemplate: async (templateData) => {
    const response = await fetch(`${API_URL}/templates`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(templateData)
    });
    return handleResponse(response);
  },
  
  updateTemplate: async (id, templateData) => {
    const response = await fetch(`${API_URL}/templates/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(templateData)
    });
    return handleResponse(response);
  },
  
  deleteTemplate: async (id) => {
    const response = await fetch(`${API_URL}/templates/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // -----------------------------------------
  // CONFIGURATION (General & Tax)
  // -----------------------------------------
  getConfiguration: async () => {
    const response = await fetch(`${API_URL}/config`, { headers: getAuthHeaders() });
    return handleResponse(response);
  },
  
  updateConfiguration: async (configData) => {
    const response = await fetch(`${API_URL}/config`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(configData)
    });
    return handleResponse(response);
  },

  // -----------------------------------------
  // OVERTIME POLICIES
  // -----------------------------------------
  getAllOvertimePolicies: async () => {
    const response = await fetch(`${API_URL}/overtime`, { headers: getAuthHeaders() });
    return handleResponse(response);
  },
  
  createOvertimePolicy: async (policyData) => {
    const response = await fetch(`${API_URL}/overtime`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(policyData)
    });
    return handleResponse(response);
  },
  
  updateOvertimePolicy: async (id, policyData) => {
    const response = await fetch(`${API_URL}/overtime/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(policyData)
    });
    return handleResponse(response);
  },
  
  deleteOvertimePolicy: async (id) => {
    const response = await fetch(`${API_URL}/overtime/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  }
};
