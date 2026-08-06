const Attendance = require('../../../models/Attendance');
const { findCompanyRecords } = require('../../../utils/tenantUtils');
const { buildFilters } = require('../../../utils/reportFilters');
const { buildReportResponse } = require('../../../utils/reportBuilder');
const { ATTENDANCE_MONTHLY } = require('../../../config/reportColumns');

const generateMonthlyAttendanceReport = async (req) => {
    // 1. Build Mongoose filters from query params
    const filters = buildFilters(req.query, {
        employee: 'employee',
        date: 'date'
    });

    // 2. Execute tenant-isolated query
    const records = await findCompanyRecords(
        Attendance,
        filters,
        req.company,
        [{ path: 'employee', select: 'employeeId firstName lastName fullName department', populate: { path: 'department', select: 'name' } }]
    );

    // 3. Aggregate data per employee
    const aggregated = {};
    let totalPresent = 0, totalAbsent = 0, totalLate = 0, totalOT = 0;

    records.forEach(record => {
        if (!record.employee) return;
        
        const empId = record.employee._id.toString();
        if (!aggregated[empId]) {
            aggregated[empId] = {
                empData: record.employee,
                present: 0,
                absent: 0,
                late: 0,
                otHours: 0,
                paidLeaves: 0,
                holidays: 0
            };
        }

        const stats = aggregated[empId];
        
        switch (record.status) {
            case 'Present':
                stats.present++;
                totalPresent++;
                break;
            case 'Late':
                stats.late++;
                stats.present++; // Late is generally counted as present for attendance days
                totalLate++;
                totalPresent++;
                break;
            case 'Absent':
                stats.absent++;
                totalAbsent++;
                break;
            case 'On Leave':
                stats.paidLeaves++;
                break;
            case 'Holiday':
                stats.holidays++;
                break;
        }

        if (record.overtimeHours > 0) {
            stats.otHours += record.overtimeHours;
            totalOT += record.overtimeHours;
        }
    });

    // 4. Map aggregated data to report rows
    const rows = Object.values(aggregated).map(data => {
        const emp = data.empData;
        return [
            emp.employeeId || '—',
            emp.fullName || `${emp.firstName} ${emp.lastName}`,
            emp.department ? emp.department.name : '—',
            '—', // Shift is not populated in this simple aggregation
            data.present,
            data.absent,
            data.late,
            data.otHours.toFixed(2),
            data.paidLeaves,
            data.holidays
        ];
    });

    // 5. Construct final JSON
    return buildReportResponse({
        title: 'Monthly Attendance Summary',
        req,
        filters: req.query,
        summary: {
            "Total Employees Included": Object.keys(aggregated).length,
            "Total Present Days": totalPresent,
            "Total Absent Days": totalAbsent,
            "Total Late Check-ins": totalLate,
            "Total OT Hours": totalOT.toFixed(2)
        },
        columns: ATTENDANCE_MONTHLY,
        rows,
        totalRecords: Object.keys(aggregated).length
    });
};

module.exports = { generateMonthlyAttendanceReport };
