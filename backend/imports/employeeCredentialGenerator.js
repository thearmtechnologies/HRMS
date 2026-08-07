const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const XLSX = require('xlsx');

const SYMBOLS = '!@#$%^&*';

const generateTempPassword = (length = 10) => {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghijkmnopqrstuvwxyz';
  const numbers = '23456789';
  const all = `${upper}${lower}${numbers}${SYMBOLS}`;

  const chars = [
    upper[Math.floor(Math.random() * upper.length)],
    lower[Math.floor(Math.random() * lower.length)],
    numbers[Math.floor(Math.random() * numbers.length)],
    SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
  ];

  while (chars.length < length) {
    const byte = crypto.randomBytes(1)[0];
    chars.push(all[byte % all.length]);
  }

  return chars.sort(() => Math.random() - 0.5).join('');
};

const hashPassword = async (password) => bcrypt.hash(password, 12);

const buildCredentialsWorkbook = (rows) => {
  const workbook = XLSX.utils.book_new();
  const sheet = XLSX.utils.aoa_to_sheet([
    ['Employee Name', 'Work Email', 'Temporary Password'],
    ...rows.map((row) => [row.employeeName, row.email, row.tempPassword]),
  ]);

  sheet['!cols'] = [{ wch: 28 }, { wch: 32 }, { wch: 24 }];
  XLSX.utils.book_append_sheet(workbook, sheet, 'Credentials');
  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
};

module.exports = {
  generateTempPassword,
  hashPassword,
  buildCredentialsWorkbook,
};