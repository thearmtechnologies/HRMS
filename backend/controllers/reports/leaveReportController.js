const { generateLeaveBalanceReport } = require('../../services/reports/leave/leaveBalanceService');
const { exportReport } = require('../../exports/exportService');

const getLeaveBalanceReport = async (req, res) => {
    try {
        const report = await generateLeaveBalanceReport(req);
        res.status(200).json(report);
    } catch (error) {
        console.error('❌ Error generating leave balance report:', error);
        res.status(500).json({ message: 'Error generating report', error: error.message });
    }
};

const exportLeaveBalanceReport = async (req, res) => {
    try {
        const { format } = req.params;
        const reportJson = await generateLeaveBalanceReport(req);
        const { buffer, contentType, filename } = await exportReport(format, reportJson, req);
        
        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(buffer);
    } catch (error) {
        console.error(`❌ Error exporting leave report as ${req.params.format}:`, error);
        res.status(500).json({ message: 'Error exporting report', error: error.message });
    }
};

module.exports = {
    getLeaveBalanceReport,
    exportLeaveBalanceReport
};
