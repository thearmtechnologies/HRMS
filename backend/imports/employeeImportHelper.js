const XLSX = require('xlsx');

const TEMPLATE_HEADERS = [
  'First Name',
  'Last Name',
  'Work Email',
  'Phone',
  'Gender',
  'Date of Birth',
  'Joining Date',
  'Department',
  'Designation',
  'Shift',
  'Reporting Manager',
  'Employment Type',
  'Work Location',
];

const normalizeString = (value) => String(value ?? '').trim();
const normalizeLower = (value) => normalizeString(value).toLowerCase();

const normalizeLookupKey = (value) => normalizeString(value)
  .replace(/\s+/g, ' ')
  .toLowerCase()
  .replace(/\s+/g, '');

const normalizeDate = (value) => {
  if (!value) return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }
  const str = String(value).trim();
  const datePattern = /^(\d{1,2})[/\-](\d{1,2})[/\-](\d{4})$/;
  const match = str.match(datePattern);
  if (match) {
    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10) - 1;
    const year = parseInt(match[3], 10);
    const date = new Date(year, month, day);
    if (!Number.isNaN(date.getTime()) && date.getDate() === day && date.getMonth() === month) {
      return date;
    }
  }
  const parsed = new Date(str);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
};

const normalizePhone = (value) => normalizeString(value).replace(/\s+/g, '');

const toCanonicalEmployeeRow = (row, rowNumber) => ({
  rowNumber,
  firstName: normalizeString(row.firstName),
  lastName: normalizeString(row.lastName),
  email: normalizeLower(row.email || row.workEmail),
  phone: normalizePhone(row.phone),
  gender: normalizeString(row.gender),
  dob: normalizeDate(row.dob),
  doj: normalizeDate(row.doj || row.joiningDate),
  department: normalizeString(row.department),
  designation: normalizeString(row.designation),
  shift: normalizeString(row.shift),
  reportingManager: normalizeString(row.reportingManager),
  employmentType: normalizeString(row.employmentType) || 'Full-time',
  workLocation: normalizeString(row.workLocation),
});

const buildErrorWorkbook = (failedRows) => {
  const workbook = XLSX.utils.book_new();
  const sheet = XLSX.utils.aoa_to_sheet([
    ['Row', 'Employee', 'Error'],
    ...failedRows.map((item) => [item.rowNumber, item.employeeName || '', item.errors.join('; ')]),
  ]);
  sheet['!cols'] = [{ wch: 8 }, { wch: 28 }, { wch: 60 }];
  XLSX.utils.book_append_sheet(workbook, sheet, 'Errors');
  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
};

const buildPreviewResponse = ({ validRows, invalidRows, totalRows }) => ({
  totalRows,
  validEmployees: validRows.length,
  invalidEmployees: invalidRows.length,
  errors: invalidRows.map((item) => ({
    rowNumber: item.rowNumber,
    employeeName: `${item.row.firstName || ''} ${item.row.lastName || ''}`.trim(),
    errors: item.errors,
  })),
});

module.exports = {
  TEMPLATE_HEADERS,
  normalizeString,
  normalizeLower,
  normalizeLookupKey,
  normalizeDate,
  normalizePhone,
  toCanonicalEmployeeRow,
  buildErrorWorkbook,
  buildPreviewResponse,
};