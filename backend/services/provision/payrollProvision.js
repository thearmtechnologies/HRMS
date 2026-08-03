const PayrollConfiguration = require('../../models/PayrollConfiguration');
const SalaryComponent = require('../../models/SalaryComponent');

const DEFAULT_COMPONENTS = [
  { name: 'Basic Salary', code: 'BASIC', description: 'Core base salary', type: 'Earning', calculationType: 'Fixed Amount', taxable: true, inCTC: true, inNet: true, defaultValue: 0, displayOrder: 1, active: true },
  { name: 'House Rent Allowance', code: 'HRA', description: 'HRA component', type: 'Earning', calculationType: 'Percentage', taxable: true, inCTC: true, inNet: true, defaultValue: 0, displayOrder: 2, active: true },
  { name: 'Medical Allowance', code: 'MED', description: 'Medical allowance', type: 'Earning', calculationType: 'Fixed Amount', taxable: false, inCTC: true, inNet: true, defaultValue: 0, displayOrder: 3, active: true },
  { name: 'Conveyance', code: 'CONV', description: 'Travel allowance', type: 'Earning', calculationType: 'Fixed Amount', taxable: false, inCTC: true, inNet: true, defaultValue: 0, displayOrder: 4, active: true },
  { name: 'Special Allowance', code: 'SPL', description: 'Special allowance', type: 'Earning', calculationType: 'Fixed Amount', taxable: true, inCTC: true, inNet: true, defaultValue: 0, displayOrder: 5, active: true },
  { name: 'Bonus', code: 'BONUS', description: 'Monthly bonus', type: 'Earning', calculationType: 'Variable', taxable: true, inCTC: false, inNet: true, defaultValue: 0, displayOrder: 6, active: true },
  { name: 'Employee PF', code: 'EPF', description: 'Employee PF contribution', type: 'Deduction', calculationType: 'Percentage', taxable: false, inCTC: true, inNet: true, defaultValue: 0, displayOrder: 7, active: true },
  { name: 'Employer PF', code: 'ERPF', description: 'Employer PF contribution', type: 'Deduction', calculationType: 'Percentage', taxable: false, inCTC: true, inNet: false, defaultValue: 0, displayOrder: 8, active: true },
  { name: 'Professional Tax', code: 'PT', description: 'State professional tax', type: 'Deduction', calculationType: 'Fixed Amount', taxable: false, inCTC: false, inNet: true, defaultValue: 200, displayOrder: 9, active: true },
  { name: 'ESI', code: 'ESI', description: 'Employee State Insurance', type: 'Deduction', calculationType: 'Percentage', taxable: false, inCTC: false, inNet: true, defaultValue: 0, displayOrder: 10, active: true }
];

async function provisionPayroll(companyId) {
  // 1. Payroll Configuration
  const payrollConfig = new PayrollConfiguration({
    company: companyId,
    isSingleton: true,
    frequency: 'Monthly',
    salaryCreditDay: 1,
    processingDate: 25,
    financialYear: 'April - March',
    currency: 'INR',
    roundSalaryAmounts: true,
    defaultCalculationMode: 'System Calculated',
    pfEnabled: true,
    pfEmployeePercent: 12,
    pfEmployerPercent: 12,
    pfWageLimit: 15000,
    esiEnabled: true,
    esiEmployeePercent: 0.75,
    esiEmployerPercent: 3.25,
    esiWageLimit: 21000,
    ptEnabled: true,
    ptDefaultAmount: 200,
    ptState: 'Maharashtra',
    salaryAdvanceEnabled: true,
    salaryAdvanceMaxLimitType: '2x Gross Salary',
    salaryAdvanceCustomLimit: 50000
  });
  await payrollConfig.save();

  // 2. Salary Components
  const componentsWithCompany = DEFAULT_COMPONENTS.map(c => ({
    ...c,
    company: companyId
  }));
  await SalaryComponent.insertMany(componentsWithCompany);
}

module.exports = { provisionPayroll };
