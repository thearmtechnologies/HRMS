const Employee = require('../../../models/Employee');
const { findCompanyRecords } = require('../../../utils/tenantUtils');
const { buildFilters } = require('../../../utils/reportFilters');
const { buildReportResponse } = require('../../../utils/reportBuilder');
const { formatDate } = require('../../../utils/reportHelpers');
const { EMPLOYEE_DIRECTORY } = require('../../../config/reportColumns');

const generateDirectoryReport = async (req) => {
    // 1. Build Mongoose filters from query params
    const filters = buildFilters(req.query, {
        department: 'department',
        designation: 'designation',
        status: 'status'
    });

    // 2. Execute tenant-isolated query
    const employees = await findCompanyRecords(
        Employee, 
        filters, 
        req.company, 
        [{ path: 'department', select: 'name' }]
    );

    // 3. Map database results to standardized report rows
    const rows = employees.map(emp => [
        emp.employeeId || '—',
        emp.fullName || `${emp.firstName} ${emp.lastName}`,
        emp.email || '—',
        emp.phone || '—',
        emp.department ? emp.department.name : '—',
        emp.designation || '—',
        emp.status || 'Active',
        formatDate(emp.joiningDate)
    ]);

    // 4. Calculate aggregates for the summary section
    const activeCount = employees.filter(e => !e.status || e.status === 'Active').length;
    const inactiveCount = employees.length - activeCount;

    // 5. Construct final standardized JSON response
    return buildReportResponse({
        title: 'Employee Directory',
        req,
        filters: req.query,
        summary: {
            "Total Employees": employees.length,
            "Active": activeCount,
            "Inactive": inactiveCount
        },
        columns: EMPLOYEE_DIRECTORY,
        rows,
        totalRecords: employees.length
    });
};

module.exports = { generateDirectoryReport };
