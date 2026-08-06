const { generateDirectoryReport } = require('../../services/reports/employee/directoryService');
const { exportReport } = require('../../exports/exportService');

const getEmployeeDirectoryReport = async (req, res) => {
    try {
        const report = await generateDirectoryReport(req);
        res.status(200).json(report);
    } catch (error) {
        console.error('❌ Error generating employee directory report:', error);
        res.status(500).json({ message: 'Error generating report', error: error.message });
    }
};

const exportEmployeeDirectoryReport = async (req, res) => {
    try {
        const { format } = req.params;
        const reportJson = await generateDirectoryReport(req);
        const { buffer, contentType, filename } = await exportReport(format, reportJson, req);
        
        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(buffer);
    } catch (error) {
        console.error(`❌ Error exporting employee report as ${req.params.format}:`, error);
        res.status(500).json({ message: 'Error exporting report', error: error.message });
    }
};

module.exports = {
    getEmployeeDirectoryReport,
    exportEmployeeDirectoryReport
};
