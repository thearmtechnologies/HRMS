/**
 * Standardizes the response structure for all reports.
 * 
 * @param {Object} params
 * @param {String} params.title - Report title
 * @param {String} params.subtitle - Optional subtitle
 * @param {Object} params.req - Express request object (to extract user/company info)
 * @param {Object} params.filters - Filter criteria used
 * @param {Object} params.summary - Totals and aggregates
 * @param {Array} params.columns - Column headers
 * @param {Array} params.rows - Array of data rows (matching columns order)
 * @param {Number} params.totalRecords - Total number of records matching filters
 * @returns {Object} Standardized report JSON
 */
const buildReportResponse = ({
    title,
    subtitle = '',
    req,
    filters = {},
    summary = {},
    columns = [],
    rows = [],
    totalRecords = 0
}) => {
    return {
        title,
        subtitle,
        generatedAt: new Date().toISOString(),
        generatedBy: req.user ? (req.user.name || req.user.email) : 'System',
        company: req.company,
        filters,
        summary,
        columns,
        rows,
        totalRecords,
        reportVersion: '1.0'
    };
};

module.exports = { buildReportResponse };
