const CompanyInfo = require('../models/CompanyInfo');
const { findOneCompanyRecord } = require('../utils/tenantUtils');
const { generatePdf } = require('./pdf/pdfGenerator');
const { generateExcel } = require('./excel/genericExcelGenerator');
const { generateCsv } = require('./csv/genericCsvGenerator');

/**
 * Main routing service for exporting reports.
 * Consumes standard JSON and returns the raw file buffer/string.
 *
 * @param {String} format - 'pdf', 'excel', or 'csv'
 * @param {Object} reportJson - The standardized JSON from the report engine
 * @param {Object} req - Express request to fetch tenant context
 * @returns {Promise<Object>} { buffer, contentType, filename }
 */
const exportReport = async (format, reportJson, req, templateName) => {
    // 1. Fetch company branding info
    const companyInfo = await findOneCompanyRecord(CompanyInfo, {}, req.company);

    // 2. Generate filename based on report title
    const safeTitle = (reportJson.title || 'Report').replace(/[^a-z0-9]/gi, '_');
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    let filename = `${safeTitle}_${dateStr}`;

    let buffer;
    let contentType;

    // 3. Route to correct generator
    switch (format.toLowerCase()) {
        case 'pdf':
            buffer = await generatePdf(reportJson, companyInfo, templateName);
            contentType = 'application/pdf';
            filename += '.pdf';
            break;
            
        case 'excel':
        case 'xlsx':
            buffer = await generateExcel(reportJson, companyInfo);
            contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
            filename += '.xlsx';
            break;
            
        case 'csv':
            const csvString = generateCsv(reportJson);
            buffer = Buffer.from(csvString, 'utf-8');
            contentType = 'text/csv';
            filename += '.csv';
            break;
            
        default:
            throw new Error(`Unsupported export format: ${format}`);
    }

    return { buffer, contentType, filename };
};

module.exports = { exportReport };
