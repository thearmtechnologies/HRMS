const { generateMonthlyAttendanceReport } = require('../../services/reports/attendance/attendanceMonthlyService');
const { generateDailyAttendanceReport, generateLateAttendanceReport, generateOvertimeAttendanceReport } = require('../../services/reports/attendance/attendanceDetailService');
const { exportReport } = require('../../exports/exportService');

const getMonthlyAttendanceReport = async (req, res) => {
    try {
        const report = await generateMonthlyAttendanceReport(req);
        res.status(200).json(report);
    } catch (error) {
        console.error('❌ Error generating monthly attendance report:', error);
        res.status(500).json({ message: 'Error generating report', error: error.message });
    }
};

const exportMonthlyAttendanceReport = async (req, res) => {
    try {
        const { format } = req.params;
        const reportJson = await generateMonthlyAttendanceReport(req);
        const { buffer, contentType, filename } = await exportReport(format, reportJson, req);
        
        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(buffer);
    } catch (error) {
        console.error(`❌ Error exporting attendance report as ${req.params.format}:`, error);
        res.status(500).json({ message: 'Error exporting report', error: error.message });
    }
};

const getDailyAttendanceReport = async (req, res) => {
    try {
        const report = await generateDailyAttendanceReport(req);
        res.status(200).json(report);
    } catch (error) {
        console.error('❌ Error generating daily attendance report:', error);
        res.status(500).json({ message: 'Error generating report', error: error.message });
    }
};

const exportDailyAttendanceReport = async (req, res) => {
    try {
        const { format } = req.params;
        const reportJson = await generateDailyAttendanceReport(req);
        const { buffer, contentType, filename } = await exportReport(format, reportJson, req);

        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(buffer);
    } catch (error) {
        console.error(`❌ Error exporting daily attendance report as ${req.params.format}:`, error);
        res.status(500).json({ message: 'Error exporting report', error: error.message });
    }
};

const getLateAttendanceReport = async (req, res) => {
    try {
        const report = await generateLateAttendanceReport(req);
        res.status(200).json(report);
    } catch (error) {
        console.error('❌ Error generating late attendance report:', error);
        res.status(500).json({ message: 'Error generating report', error: error.message });
    }
};

const exportLateAttendanceReport = async (req, res) => {
    try {
        const { format } = req.params;
        const reportJson = await generateLateAttendanceReport(req);
        const { buffer, contentType, filename } = await exportReport(format, reportJson, req);

        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(buffer);
    } catch (error) {
        console.error(`❌ Error exporting late attendance report as ${req.params.format}:`, error);
        res.status(500).json({ message: 'Error exporting report', error: error.message });
    }
};

const getOvertimeAttendanceReport = async (req, res) => {
    try {
        const report = await generateOvertimeAttendanceReport(req);
        res.status(200).json(report);
    } catch (error) {
        console.error('❌ Error generating overtime attendance report:', error);
        res.status(500).json({ message: 'Error generating report', error: error.message });
    }
};

const exportOvertimeAttendanceReport = async (req, res) => {
    try {
        const { format } = req.params;
        const reportJson = await generateOvertimeAttendanceReport(req);
        const { buffer, contentType, filename } = await exportReport(format, reportJson, req);

        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(buffer);
    } catch (error) {
        console.error(`❌ Error exporting overtime attendance report as ${req.params.format}:`, error);
        res.status(500).json({ message: 'Error exporting report', error: error.message });
    }
};

module.exports = {
    getMonthlyAttendanceReport,
    exportMonthlyAttendanceReport,
    getDailyAttendanceReport,
    exportDailyAttendanceReport,
    getLateAttendanceReport,
    exportLateAttendanceReport,
    getOvertimeAttendanceReport,
    exportOvertimeAttendanceReport
};
