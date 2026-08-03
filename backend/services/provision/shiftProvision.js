const Shift = require('../../models/Shift');

async function provisionShift(companyId) {
  const defaultShift = new Shift({
    name: 'General Shift',
    type: 'Fixed',
    startTime: '09:00',
    endTime: '18:00',
    weeklyOffDays: ['Saturday', 'Sunday'],
    breakDuration: 1,
    isDefault: true,
    lateCheckInGraceTime: 15,
    earlyCheckOutGraceTime: 15,
    company: companyId
  });
  await defaultShift.save();
}

module.exports = { provisionShift };
