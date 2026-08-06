/**
 * Centralized column definitions for all reports in the HRMS.
 * Defines the exact headers that will be returned in the JSON response,
 * ensuring consistency across UI, PDF, CSV, and Excel exports.
 */

module.exports = {
    // --- Employee Reports ---
    EMPLOYEE_DIRECTORY: [
        "Employee ID",
        "Full Name",
        "Email",
        "Phone",
        "Department",
        "Designation",
        "Status",
        "Date of Joining"
    ],
    
    // --- Attendance Reports ---
    ATTENDANCE_MONTHLY: [
        "Employee ID",
        "Name",
        "Department",
        "Shift",
        "Present Days",
        "Absent Days",
        "Late Check-ins",
        "Overtime Hours",
        "Paid Leaves",
        "Holidays"
    ],
    ATTENDANCE_DAILY: [
        "Date",
        "Employee ID",
        "Name",
        "Department",
        "Designation",
        "Status",
        "Check In",
        "Check Out",
        "Working Hours",
        "Overtime Hours",
        "Missing Punch"
    ],
    ATTENDANCE_LATE: [
        "Date",
        "Employee ID",
        "Name",
        "Department",
        "Designation",
        "Check In",
        "Check Out",
        "Late By",
        "Working Hours",
        "Overtime Hours"
    ],
    ATTENDANCE_OVERTIME: [
        "Date",
        "Employee ID",
        "Name",
        "Department",
        "Designation",
        "Status",
        "Check In",
        "Check Out",
        "Working Hours",
        "Overtime Hours"
    ],
    
    // --- Leave Reports ---
    LEAVE_BALANCE: [
        "Employee ID",
        "Name",
        "Department",
        "Leave Type",
        "Total Quota",
        "Used",
        "Available Balance"
    ],
    
    // --- Payroll Reports ---
    PAYROLL_REGISTER: [
        "Employee ID",
        "Name",
        "Department",
        "Designation",
        "Gross Salary",
        "Total Deductions",
        "Net Salary",
        "Overtime Pay",
        "Late Deductions",
        "Bonus",
        "Employee PF",
        "ESI"
    ]
};
