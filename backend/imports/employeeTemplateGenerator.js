const ExcelJS = require('exceljs');
const Department = require('../models/Department');
const Designation = require('../models/Designation');
const Shift = require('../models/Shift');
const { findCompanyRecords } = require('../utils/tenantUtils');
const { TEMPLATE_HEADERS } = require('./employeeImportHelper');

const addValidation = (worksheet, columnLetter, sourceSheetName, startRow, endRow) => {
  worksheet.dataValidations.add(`${columnLetter}${startRow}:${columnLetter}${endRow}`, {
    type: 'list',
    allowBlank: true,
    formulae: [`=${sourceSheetName}List`],
    showErrorMessage: true,
    errorStyle: 'error',
    errorTitle: 'Invalid value',
    error: 'Please select a value from the dropdown list.',
  });
};

const addInlineValidation = (worksheet, columnLetter, values, startRow, endRow) => {
  worksheet.dataValidations.add(`${columnLetter}${startRow}:${columnLetter}${endRow}`, {
    type: 'list',
    allowBlank: true,
    formulae: [`"${values.join(',')}"`],
    showErrorMessage: true,
    errorStyle: 'error',
    errorTitle: 'Invalid value',
    error: `Please select one of: ${values.join(', ')}`,
  });
};

const addDateValidation = (worksheet, columnLetter, startRow, endRow) => {
  worksheet.dataValidations.add(`${columnLetter}${startRow}:${columnLetter}${endRow}`, {
    type: 'date',
    operator: 'between',
    allowBlank: true,
    formulae: [new Date(2000, 0, 1), new Date(2050, 11, 31)],
    showErrorMessage: true,
    errorStyle: 'error',
    errorTitle: 'Invalid Date',
    error: 'Please enter a valid date between 01/01/2000 and 31/12/2050 (Format: DD/MM/YYYY).',
  });
};

const generateEmployeeTemplate = async (companyId) => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'HRMS';
  workbook.created = new Date();

  const employeesSheet = workbook.addWorksheet('Employee Import');
  const departmentsSheet = workbook.addWorksheet('Departments');
  const designationsSheet = workbook.addWorksheet('Designations');
  const shiftsSheet = workbook.addWorksheet('Shifts');

  const departments = await findCompanyRecords(Department, {}, companyId);
  const designations = await findCompanyRecords(Designation, { isActive: { $ne: false } }, companyId);
  const shifts = await findCompanyRecords(Shift, {}, companyId);

  const departmentNames = departments.map((item) => item.departmentName).filter(Boolean);
  const designationNames = designations.map((item) => item.name).filter(Boolean);
  const shiftNames = shifts.map((item) => item.name).filter(Boolean);

  employeesSheet.addRow(TEMPLATE_HEADERS);
  employeesSheet.getRow(1).font = { bold: true };
  employeesSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF3B82F6' } };
  employeesSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  employeesSheet.views = [{ state: 'frozen', ySplit: 1 }];

  employeesSheet.columns = TEMPLATE_HEADERS.map((header) => ({ header, width: Math.max(14, header.length + 4) }));
  employeesSheet.columns[2].width = 28;
  employeesSheet.columns[7].width = 24;
  employeesSheet.columns[8].width = 24;
  employeesSheet.columns[9].width = 22;
  employeesSheet.columns[10].width = 24;
  employeesSheet.columns[11].width = 18;
  employeesSheet.columns[12].width = 20;

  // Format Date of Birth (F) and Joining Date (G) columns as DD/MM/YYYY
  for (let rowNum = 2; rowNum <= 500; rowNum++) {
    employeesSheet.getCell(`F${rowNum}`).numFmt = 'dd/mm/yyyy';
    employeesSheet.getCell(`G${rowNum}`).numFmt = 'dd/mm/yyyy';
  }

  departmentsSheet.addRow(['Department']);
  departmentNames.forEach((name) => departmentsSheet.addRow([name]));
  designationsSheet.addRow(['Designation']);
  designationNames.forEach((name) => designationsSheet.addRow([name]));
  shiftsSheet.addRow(['Shift']);
  shiftNames.forEach((name) => shiftsSheet.addRow([name]));

  [departmentsSheet, designationsSheet, shiftsSheet].forEach((sheet) => {
    sheet.getRow(1).font = { bold: true };
    sheet.columns = [{ width: 28 }];
  });

  const departmentEndRow = Math.max(2, departmentNames.length + 1);
  const designationEndRow = Math.max(2, designationNames.length + 1);
  const shiftEndRow = Math.max(2, shiftNames.length + 1);

  workbook.definedNames.add(`'Departments'!$A$2:$A$${departmentEndRow}`, 'DepartmentsList');
  workbook.definedNames.add(`'Designations'!$A$2:$A$${designationEndRow}`, 'DesignationsList');
  workbook.definedNames.add(`'Shifts'!$A$2:$A$${shiftEndRow}`, 'ShiftsList');

  // Column H = Department, I = Designation, J = Shift (reference sheet dropdowns)
  addValidation(employeesSheet, 'H', 'Departments', 2, 500);
  addValidation(employeesSheet, 'I', 'Designations', 2, 500);
  addValidation(employeesSheet, 'J', 'Shifts', 2, 500);

  // Column E = Gender dropdown (inline — small fixed list)
  addInlineValidation(employeesSheet, 'E', ['Male', 'Female', 'Other'], 2, 500);

  // Column L = Employment Type dropdown (inline — small fixed list)
  addInlineValidation(employeesSheet, 'L', ['Full-time', 'Part-time', 'Contract', 'Intern'], 2, 500);

  // Column F = Date of Birth validation, Column G = Joining Date validation
  addDateValidation(employeesSheet, 'F', 2, 500);
  addDateValidation(employeesSheet, 'G', 2, 500);

  departmentsSheet.state = 'visible';
  designationsSheet.state = 'visible';
  shiftsSheet.state = 'visible';

  return workbook.xlsx.writeBuffer();
};

module.exports = { generateEmployeeTemplate };