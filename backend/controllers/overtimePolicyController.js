const OvertimePolicy = require('../models/OvertimePolicy');
const { createCompanyRecord, findCompanyRecords, updateCompanyRecord, deleteCompanyRecord, findOneCompanyRecord } = require("../utils/tenantUtils");

exports.getAllPolicies = async (req, res) => {
  try {
    const policies = await findCompanyRecords(OvertimePolicy, {}, req.company);
    res.status(200).json(policies);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching overtime policies', error: error.message });
  }
};

exports.createPolicy = async (req, res) => {
  try {
    if (req.body.name) {
      const existing = await findOneCompanyRecord(OvertimePolicy, { name: req.body.name }, req.company);
      if (existing) return res.status(400).json({ message: 'Overtime policy with this name already exists' });
    }
    const policy = await createCompanyRecord(OvertimePolicy, req.body, req.company);
    res.status(201).json(policy);
  } catch (error) {
    res.status(400).json({ message: 'Error creating overtime policy', error: error.message });
  }
};

exports.updatePolicy = async (req, res) => {
  try {
    if (req.body.name) {
      const existing = await findOneCompanyRecord(OvertimePolicy, { name: req.body.name, _id: { $ne: req.params.id } }, req.company);
      if (existing) return res.status(400).json({ message: 'Overtime policy with this name already exists' });
    }
    const policy = await updateCompanyRecord(OvertimePolicy, req.params.id, req.company, req.body, { new: true, runValidators: true });
    if (!policy) {
      return res.status(404).json({ message: 'Policy not found' });
    }
    res.status(200).json(policy);
  } catch (error) {
    res.status(400).json({ message: 'Error updating overtime policy', error: error.message });
  }
};

exports.deletePolicy = async (req, res) => {
  try {
    const policy = await deleteCompanyRecord(OvertimePolicy, req.params.id, req.company);
    if (!policy) {
      return res.status(404).json({ message: 'Policy not found' });
    }
    res.status(200).json({ message: 'Policy deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting overtime policy', error: error.message });
  }
};
