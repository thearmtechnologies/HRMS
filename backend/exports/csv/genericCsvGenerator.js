/**
 * Generates a generic CSV file string from the standard report JSON object.
 *
 * @param {Object} reportJson - Standardized report JSON
 * @returns {String} CSV string content
 */
const generateCsv = (reportJson) => {
    const { columns = [], rows = [] } = reportJson;

    // Helper to escape CSV fields correctly
    const escapeField = (field) => {
        if (field === null || field === undefined) return '';
        const str = String(field);
        // If the string contains quotes, commas, or newlines, wrap in quotes and double the quotes
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
    };

    const csvRows = [];

    // Add headers
    csvRows.push(columns.map(escapeField).join(','));

    // Add data rows
    if (rows.length === 0) {
        csvRows.push(escapeField('No records found'));
    } else {
        rows.forEach(row => {
            csvRows.push(row.map(escapeField).join(','));
        });
    }

    // Prepend UTF-8 BOM (\uFEFF) so Excel opens it with correct encoding
    return '\uFEFF' + csvRows.join('\n');
};

module.exports = { generateCsv };
