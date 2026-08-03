const roleProvision = require('./provision/roleProvision');
const leaveProvision = require('./provision/leaveProvision');
const shiftProvision = require('./provision/shiftProvision');
const payrollProvision = require('./provision/payrollProvision');
const companyInfoProvision = require('./provision/companyInfoProvision');
const rollbackProvisionService = require('./rollbackProvisionService');
const Company = require('../models/Company');

/**
 * Orchestrates the full workspace provisioning process for a newly created company.
 * @param {Object} company - The company object to provision
 * @param {ObjectId} adminUserId - The ID of the admin user created for this company
 * @returns {Promise<boolean>} - True if successful, throws error otherwise
 */
const provisionCompany = async (company, adminUserId) => {
  const companyId = company._id;
  try {
    // Phase 1: Initialize System Roles & Assign Admin
    await roleProvision.provisionRoles(companyId, adminUserId);

    // Phase 2: Initialize Leave Management 
    await leaveProvision.provisionLeave(companyId);

    // Phase 3: Initialize Shift Management
    await shiftProvision.provisionShift(companyId);

    // Phase 4: Initialize Payroll Engine
    await payrollProvision.provisionPayroll(companyId);

    // Phase 5: Initialize Company Info Template
    await companyInfoProvision.provisionCompanyInfo(companyId, company);

    // Finalize: Mark workspace as provisioned
    await Company.findByIdAndUpdate(companyId, { isWorkspaceProvisioned: true });

    return true;
  } catch (error) {
    console.error(`Provisioning failed for company ${companyId}:`, error);
    // Execute rollback if something fails during provisioning
    await rollbackProvisionService.rollbackProvisioning(companyId);
    throw new Error(`Workspace provisioning failed: ${error.message}`);
  }
};

module.exports = {
  provisionCompany
};
