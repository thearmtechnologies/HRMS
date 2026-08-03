const Role = require('../models/Role');
const LeaveType = require('../models/LeaveType');
const LeaveSettings = require('../models/LeaveSettings');
const Shift = require('../models/Shift');
const OvertimePolicy = require('../models/OvertimePolicy');
const PayrollConfiguration = require('../models/PayrollConfiguration');
const PayrollTemplate = require('../models/PayrollTemplate');
const SalaryComponent = require('../models/SalaryComponent');
const CompanyInfo = require('../models/CompanyInfo');

/**
 * Rolls back any provisioned workspace data for a company if provisioning fails.
 * @param {ObjectId} companyId - The ID of the company
 */
const rollbackProvisioning = async (companyId) => {
  try {
    console.log(`Starting rollback for company ${companyId}...`);
    
    // Delete Roles
    await Role.deleteMany({ company: companyId });

    // Delete Leave configurations
    await LeaveType.deleteMany({ company: companyId });
    await LeaveSettings.deleteMany({ company: companyId });

    // Delete Shifts & Overtime
    await Shift.deleteMany({ company: companyId });
    await OvertimePolicy.deleteMany({ company: companyId });

    // Delete Payroll configurations
    await PayrollConfiguration.deleteMany({ company: companyId });
    await PayrollTemplate.deleteMany({ company: companyId });
    await SalaryComponent.deleteMany({ company: companyId });

    // Delete CompanyInfo
    await CompanyInfo.deleteMany({ company: companyId });

    console.log(`Rollback completed successfully for company ${companyId}.`);
  } catch (error) {
    console.error(`Failed to execute complete rollback for company ${companyId}:`, error);
    // We swallow the error here because it's already a rollback scenario.
    // The main process will throw the original provisioning error.
  }
};

module.exports = {
  rollbackProvisioning
};
