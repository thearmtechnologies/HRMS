const OvertimePolicy = require('../../models/OvertimePolicy');

async function provisionOvertime(companyId) {
  const policy = new OvertimePolicy({
    name: 'Standard Overtime',
    description: 'Default company overtime calculation policy',
    calculationType: 'Fixed Amount',
    rate: 200,
    minimumOvertimeHours: 1,
    isActive: true,
    company: companyId
  });
  await policy.save();
}

module.exports = { provisionOvertime };
