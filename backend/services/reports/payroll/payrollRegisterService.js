const Payroll = require('../../../models/Payroll');
const { findCompanyRecords } = require('../../../utils/tenantUtils');
const { buildFilters } = require('../../../utils/reportFilters');
const { buildReportResponse } = require('../../../utils/reportBuilder');
const { formatCurrency } = require('../../../utils/reportHelpers');
const { PAYROLL_REGISTER } = require('../../../config/reportColumns');

const generatePayrollRegisterReport = async (req) => {
    // 1. Build Mongoose filters
    const filters = buildFilters(req.query, {
        employee: 'employee'
    });

    if (req.query.month) filters.month = parseInt(req.query.month, 10);
    if (req.query.year) filters.year = parseInt(req.query.year, 10);

    // 2. Execute tenant-isolated query
    const records = await findCompanyRecords(
        Payroll,
        filters,
        req.company,
        [{ path: 'employee', select: 'employeeId firstName lastName fullName department designation', populate: { path: 'department', select: 'name' } }]
    );

    // 3. Map database results to standardized report rows
    let totalGross = 0;
    let totalNet = 0;
    let totalDeductions = 0;

    const rows = records.map(record => {
        if (!record.employee) return null;
        const emp = record.employee;
        
        // Calculate dynamic deductions
        const snapshot = record.salaryStructureSnapshot || {};
        const pf = snapshot.employeePFMonthly || 0;
        const esi = snapshot.esiEmployee || 0;
        const pt = record.professionalTax || 0;
        const otherDed = record.otherDed || 0;
        const leaveDed = record.leaveDeduction || 0;
        const advDed = record.advanceDeduction || 0;
        
        const totDed = pf + esi + pt + otherDed + leaveDed + advDed;

        totalGross += record.grossSalary || 0;
        totalNet += record.netPay || 0;
        totalDeductions += totDed;

        return [
            emp.employeeId || '—',
            emp.fullName || `${emp.firstName} ${emp.lastName}`,
            emp.department ? emp.department.name : '—',
            emp.designation || '—',
            formatCurrency(record.grossSalary),
            formatCurrency(totDed),
            formatCurrency(record.netPay),
            formatCurrency(record.overtimeAmount),
            formatCurrency(leaveDed),
            formatCurrency(snapshot.bonusMonthly),
            formatCurrency(pf),
            formatCurrency(esi)
        ];
    }).filter(Boolean);

    // 4. Construct final JSON
    return buildReportResponse({
        title: 'Payroll Register',
        subtitle: (req.query.month && req.query.year) ? `For ${req.query.month}/${req.query.year}` : '',
        req,
        filters: req.query,
        summary: {
            "Total Employees Processed": records.length,
            "Total Gross Salary": formatCurrency(totalGross),
            "Total Deductions": formatCurrency(totalDeductions),
            "Total Net Payout": formatCurrency(totalNet)
        },
        columns: PAYROLL_REGISTER,
        rows,
        totalRecords: records.length
    });
};

module.exports = { generatePayrollRegisterReport };
