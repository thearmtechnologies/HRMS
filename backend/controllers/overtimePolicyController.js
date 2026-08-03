const OvertimePolicy = require('../models/OvertimePolicy');

exports.getAllPolicies = async (req, res) => {
  try {
    const policies = await OvertimePolicy.find({ company: req.company });
    res.status(200).json(policies);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching overtime policies', error: error.message });
  }
};

exports.createPolicy = async (req, res) => {
  try {
    if (req.body.name) {
      const existing = await OvertimePolicy.findOne({ name: req.body.name, company: req.company });
      if (existing) return res.status(400).json({ message: 'Overtime policy with this name already exists' });
    }
    const policy = new OvertimePolicy({ ...req.body, company: req.company });
    await policy.save();
    res.status(201).json(policy);
  } catch (error) {
    res.status(400).json({ message: 'Error creating overtime policy', error: error.message });
  }
};

exports.updatePolicy = async (req, res) => {
  try {
    if (req.body.name) {
      const existing = await OvertimePolicy.findOne({ name: req.body.name, company: req.company, _id: { $ne: req.params.id } });
      if (existing) return res.status(400).json({ message: 'Overtime policy with this name already exists' });
    }
    const policy = await OvertimePolicy.findOneAndUpdate(
      { _id: req.params.id, company: req.company },
      req.body,
      { new: true, runValidators: true }
    );
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
    const policy = await OvertimePolicy.findOneAndDelete({ _id: req.params.id, company: req.company });
    if (!policy) {
      return res.status(404).json({ message: 'Policy not found' });
    }
    res.status(200).json({ message: 'Policy deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting overtime policy', error: error.message });
  }
};
