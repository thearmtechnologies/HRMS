const API_URL = 'http://localhost:5000/api/reports';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`
  };
};

export const exportReport = async (category, reportType, format, filters = {}) => {
  try {
    // Build query string from filters
    const queryParams = new URLSearchParams(filters).toString();
    const url = `${API_URL}/${category}/${reportType}/export/${format}${queryParams ? `?${queryParams}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to export report');
    }

    // Get filename from Content-Disposition header
    let filename = `Report.${format}`;
    const disposition = response.headers.get('content-disposition');
    if (disposition && disposition.indexOf('attachment') !== -1) {
      const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
      const matches = filenameRegex.exec(disposition);
      if (matches != null && matches[1]) {
        filename = matches[1].replace(/['"]/g, '');
      }
    }

    // Create a blob from the response and trigger download
    const blob = await response.blob();
    const windowUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = windowUrl;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(windowUrl);

    return true;
  } catch (error) {
    console.error('Error downloading report:', error);
    throw error;
  }
};
