const OvertimePolicy = require('../models/OvertimePolicy');

exports.getAllPolicies = async (req, res) => {
  try {
    const policies = await OvertimePolicy.find();
    res.status(200).json(policies);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching overtime policies', error: error.message });
  }
};

exports.createPolicy = async (req, res) => {
  try {
    const policy = new OvertimePolicy(req.body);
    await policy.save();
    res.status(201).json(policy);
  } catch (error) {
    res.status(400).json({ message: 'Error creating overtime policy', error: error.message });
  }
};

exports.updatePolicy = async (req, res) => {
  try {
    const policy = await OvertimePolicy.findByIdAndUpdate(
      req.params.id,
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
    const policy = await OvertimePolicy.findByIdAndDelete(req.params.id);
    if (!policy) {
      return res.status(404).json({ message: 'Policy not found' });
    }
    res.status(200).json({ message: 'Policy deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting overtime policy', error: error.message });
  }
};
