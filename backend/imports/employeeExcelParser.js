const XLSX = require('xlsx');
const { TEMPLATE_HEADERS, toCanonicalEmployeeRow } = require('./employeeImportHelper');

const HEADER_ALIASES = new Map([
  ['first name', 'firstName'],
  ['last name', 'lastName'],
  ['work email', 'email'],
  ['email', 'email'],
  ['phone', 'phone'],
  ['gender', 'gender'],
  ['date of birth', 'dob'],
  ['dob', 'dob'],
  ['joining date', 'doj'],
  ['date of joining', 'doj'],
  ['department', 'department'],
  ['designation', 'designation'],
  ['shift', 'shift'],
  ['reporting manager', 'reportingManager'],
  ['employment type', 'employmentType'],
  ['work location', 'workLocation'],
]);

const parseEmployeeWorkbook = (buffer) => {
  const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    const error = new Error('The uploaded Excel file does not contain any sheets.');
    error.statusCode = 400;
    throw error;
  }

  const worksheet = workbook.Sheets[sheetName];
  const rawRows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '', blankrows: false });
  if (!rawRows.length) {
    const error = new Error('The uploaded Excel file is empty.');
    error.statusCode = 400;
    throw error;
  }

  const headerRow = rawRows[0].map((header) => String(header || '').trim().toLowerCase());
  const headerMap = {};
  headerRow.forEach((header, index) => {
    const canonical = HEADER_ALIASES.get(header);
    if (canonical) headerMap[index] = canonical;
  });

  const missingTemplateHeaders = TEMPLATE_HEADERS.filter((header) => !headerRow.includes(header.toLowerCase()));
  if (missingTemplateHeaders.length && headerRow.length < 3) {
    const error = new Error('The uploaded file must use the employee import template.');
    error.statusCode = 400;
    throw error;
  }

  const rows = [];
  for (let index = 1; index < rawRows.length; index += 1) {
    const rowValues = rawRows[index];
    if (!rowValues || rowValues.every((value) => String(value ?? '').trim() === '')) continue;

    const rowObject = {};
    rowValues.forEach((value, cellIndex) => {
      const key = headerMap[cellIndex];
      if (key) rowObject[key] = value;
    });

    rows.push(toCanonicalEmployeeRow(rowObject, index + 1));
  }

  return rows;
};

module.exports = { parseEmployeeWorkbook };