const LeaveBalance = require('../../../models/LeaveBalance');
const { findCompanyRecords } = require('../../../utils/tenantUtils');
const { buildFilters } = require('../../../utils/reportFilters');
const { buildReportResponse } = require('../../../utils/reportBuilder');
const { LEAVE_BALANCE } = require('../../../config/reportColumns');

const generateLeaveBalanceReport = async (req) => {
    // 1. Build Mongoose filters
    const filters = buildFilters(req.query, {
        employee: 'employee'
    });

    // 2. Execute tenant-isolated query
    const records = await findCompanyRecords(
        LeaveBalance,
        filters,
        req.company,
        [{ path: 'employee', select: 'employeeId firstName lastName fullName department', populate: { path: 'department', select: 'name' } }]
    );

    // 3. Map database results to standardized report rows
    const rows = [];
    let totalBalances = 0;
    
    // Convert fixed and dynamic fields to individual rows per leave type
    records.forEach(record => {
        if (!record.employee) return;
        const emp = record.employee;
        const empId = emp.employeeId || '—';
        const empName = emp.fullName || `${emp.firstName} ${emp.lastName}`;
        const dept = emp.department ? emp.department.name : '—';

        // Helper to push a row
        const pushRow = (type, bal) => {
            if (!bal || (!bal.total && !bal.used && !bal.available)) return;
            rows.push([
                empId,
                empName,
                dept,
                type,
                bal.total || 0,
                bal.used || 0,
                bal.available || 0
            ]);
            totalBalances++;
        };

        pushRow('Casual Leave', record.casualLeave);
        pushRow('Sick Leave', record.sickLeave);
        pushRow('Earned Leave', record.earnedLeave);
        pushRow('Comp Off', record.compOff);
        
        // Handle dynamic balances
        if (record.dynamicBalances) {
            for (const [key, val] of record.dynamicBalances.entries()) {
                pushRow(key, val);
            }
        }
    });

    // 4. Construct final JSON
    return buildReportResponse({
        title: 'Employee Leave Balances',
        req,
        filters: req.query,
        summary: {
            "Total Employees": records.length,
            "Total Leave Records": totalBalances
        },
        columns: LEAVE_BALANCE,
        rows,
        totalRecords: rows.length
    });
};

module.exports = { generateLeaveBalanceReport };
