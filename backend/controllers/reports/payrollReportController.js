const { generatePayrollRegisterReport } = require('../../services/reports/payroll/payrollRegisterService');
const { exportReport } = require('../../exports/exportService');

const getPayrollRegisterReport = async (req, res) => {
    try {
        const report = await generatePayrollRegisterReport(req);
        res.status(200).json(report);
    } catch (error) {
        console.error('❌ Error generating payroll register report:', error);
        res.status(500).json({ message: 'Error generating report', error: error.message });
    }
};

const exportPayrollRegisterReport = async (req, res) => {
    try {
        const { format } = req.params;
        const reportJson = await generatePayrollRegisterReport(req);
        const { buffer, contentType, filename } = await exportReport(format, reportJson, req);
        
        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(buffer);
    } catch (error) {
        console.error(`❌ Error exporting payroll report as ${req.params.format}:`, error);
        res.status(500).json({ message: 'Error exporting report', error: error.message });
    }
};

module.exports = {
    getPayrollRegisterReport,
    exportPayrollRegisterReport
};
