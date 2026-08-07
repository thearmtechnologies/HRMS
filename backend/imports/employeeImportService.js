const { generateEmployeeTemplate } = require('./employeeTemplateGenerator');
const { parseEmployeeWorkbook } = require('./employeeExcelParser');
const { validateEmployeeImportRows } = require('./employeeImportValidator');
const { buildCredentialsWorkbook, generateTempPassword } = require('./employeeCredentialGenerator');
const { buildErrorWorkbook, buildPreviewResponse } = require('./employeeImportHelper');
const { createEmployeeAccount } = require('../services/employeeCreationService');
const { sendBulkEmployeeCredentialsEmail } = require('../config/emailService');

const toBase64Payload = (filename, buffer, mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') => ({
  filename,
  mimeType,
  data: buffer.toString('base64'),
});

const getTemplateBuffer = async (companyId) => generateEmployeeTemplate(companyId);

const previewImport = async (req) => {
  if (!req.file?.buffer) {
    const error = new Error('Excel file is required.');
    error.statusCode = 400;
    throw error;
  }

  const rows = parseEmployeeWorkbook(req.file.buffer);
  const { validatedRows, invalidRows } = await validateEmployeeImportRows(rows, req.company);
  return {
    ...buildPreviewResponse({ validRows: validatedRows, invalidRows, totalRows: rows.length }),
    action: 'preview',
  };
};

const confirmImport = async (req) => {
  if (!req.file?.buffer) {
    const error = new Error('Excel file is required.');
    error.statusCode = 400;
    throw error;
  }

  const sendCredentialsByEmail = String(req.body.sendCredentialsByEmail || 'true') !== 'false';
  const rows = parseEmployeeWorkbook(req.file.buffer);
  const { validatedRows, invalidRows } = await validateEmployeeImportRows(rows, req.company);

  const createdEmployees = [];
  const failedRows = [...invalidRows];
  const credentialRows = [];
  const usedPasswords = new Set();

  const getUniqueTempPassword = () => {
    let password = generateTempPassword();
    while (usedPasswords.has(password)) {
      password = generateTempPassword();
    }
    usedPasswords.add(password);
    return password;
  };

  for (const row of validatedRows) {
    try {
      const tempPassword = getUniqueTempPassword();
      const { employee, user, company } = await createEmployeeAccount({
        employeeData: {
          firstName: row.firstName,
          lastName: row.lastName,
          email: row.email,
          mobile: row.phone,
          gender: row.gender,
          dob: row.dob,
          doj: row.doj,
          department: row.department,
          designation: row.designation,
          shift: row.shift,
          reportingManager: row.reportingManager,
          employmentType: row.employmentType,
          workLocation: row.workLocation,
          status: 'Active',
        },
        req,
        companyId: req.company,
        role: 'employee',
        tempPassword,
      });

      createdEmployees.push({ employee, user });
      credentialRows.push({
        employeeName: employee.fullName || `${employee.firstName} ${employee.lastName}`.trim(),
        email: user.email,
        tempPassword,
      });

      if (sendCredentialsByEmail) {
        const companyName = company?.companyName || req.user?.company?.companyName || 'HRMS';
        const loginUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        await sendBulkEmployeeCredentialsEmail(user.email, employee.fullName || `${employee.firstName} ${employee.lastName}`.trim(), companyName, tempPassword, loginUrl).catch(() => {});
      }
    } catch (error) {
      failedRows.push({
        rowNumber: row.rowNumber,
        row,
        errors: [error.message || 'Failed to create employee'],
      });
    }
  }

  const downloads = [];
  if (!sendCredentialsByEmail && credentialRows.length) {
    downloads.push(toBase64Payload('Employee_Login_Credentials.xlsx', buildCredentialsWorkbook(credentialRows)));
  }

  if (failedRows.length) {
    downloads.push(toBase64Payload('Employee_Import_Errors.xlsx', buildErrorWorkbook(failedRows)));
  }

  return {
    action: 'confirm',
    totalRows: rows.length,
    created: createdEmployees.length,
    failed: failedRows.length,
    validEmployees: validatedRows.length,
    invalidEmployees: failedRows.length,
    errors: failedRows.map((item) => ({
      rowNumber: item.rowNumber,
      employeeName: `${item.row?.firstName || ''} ${item.row?.lastName || ''}`.trim(),
      errors: item.errors,
    })),
    downloads,
  };
};

module.exports = {
  getTemplateBuffer,
  previewImport,
  confirmImport,
};