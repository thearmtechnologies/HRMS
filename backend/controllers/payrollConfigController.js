const SalaryComponent = require('../models/SalaryComponent');
const PayrollTemplate = require('../models/PayrollTemplate');
const PayrollConfiguration = require('../models/PayrollConfiguration');

// ----------------------------------------------------
// SALARY COMPONENTS
// ----------------------------------------------------

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

exports.getAllComponents = async (req, res) => {
  try {
    let components = await SalaryComponent.find({ company: req.company }).sort({ displayOrder: 1, createdAt: 1 });
    
    // Auto-seed if completely empty
    if (components.length === 0) {
      const defaultWithCompany = DEFAULT_COMPONENTS.map(c => ({ ...c, company: req.company }));
      await SalaryComponent.insertMany(defaultWithCompany);
      components = await SalaryComponent.find({ company: req.company }).sort({ displayOrder: 1, createdAt: 1 });
    }
    
    res.status(200).json(components);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching components', error: error.message });
  }
};

exports.createComponent = async (req, res) => {
  try {
    const existingName = await SalaryComponent.findOne({ name: req.body.name, company: req.company });
    if (existingName) return res.status(400).json({ message: 'Component with this name already exists' });
    
    const existingCode = await SalaryComponent.findOne({ code: req.body.code.toUpperCase(), company: req.company });
    if (existingCode) return res.status(400).json({ message: 'Component with this code already exists' });

    const newComponent = new SalaryComponent({ ...req.body, company: req.company });
    await newComponent.save();
    res.status(201).json(newComponent);
  } catch (error) {
    res.status(400).json({ message: 'Error creating component', error: error.message });
  }
};

exports.updateComponent = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check duplicates excluding self
    const existingName = await SalaryComponent.findOne({ name: req.body.name, company: req.company, _id: { $ne: id } });
    if (existingName) return res.status(400).json({ message: 'Component with this name already exists' });
    
    const existingCode = await SalaryComponent.findOne({ code: req.body.code.toUpperCase(), company: req.company, _id: { $ne: id } });
    if (existingCode) return res.status(400).json({ message: 'Component with this code already exists' });

    const updated = await SalaryComponent.findOneAndUpdate({ _id: id, company: req.company }, req.body, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ message: 'Component not found' });
    
    res.status(200).json(updated);
  } catch (error) {
    res.status(400).json({ message: 'Error updating component', error: error.message });
  }
};

exports.deleteComponent = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if used in any templates
    const usedInTemplate = await PayrollTemplate.findOne({ components: id, company: req.company });
    if (usedInTemplate) {
      return res.status(400).json({ message: `Cannot delete component because it is used in the template "${usedInTemplate.name}"` });
    }

    const deleted = await SalaryComponent.findOneAndDelete({ _id: id, company: req.company });
    if (!deleted) return res.status(404).json({ message: 'Component not found' });
    
    res.status(200).json({ message: 'Component deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting component', error: error.message });
  }
};

// ----------------------------------------------------
// PAYROLL TEMPLATES
// ----------------------------------------------------

exports.getAllTemplates = async (req, res) => {
  try {
    const templates = await PayrollTemplate.find({ company: req.company }).sort({ createdAt: -1 });
    res.status(200).json(templates);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching templates', error: error.message });
  }
};

exports.createTemplate = async (req, res) => {
  try {
    const existing = await PayrollTemplate.findOne({ name: req.body.name, company: req.company });
    if (existing) return res.status(400).json({ message: 'Template with this name already exists' });

    const newTemplate = new PayrollTemplate({ ...req.body, company: req.company });
    await newTemplate.save();
    res.status(201).json(newTemplate);
  } catch (error) {
    res.status(400).json({ message: 'Error creating template', error: error.message });
  }
};

exports.updateTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    
    const existing = await PayrollTemplate.findOne({ name: req.body.name, company: req.company, _id: { $ne: id } });
    if (existing) return res.status(400).json({ message: 'Template with this name already exists' });

    const updated = await PayrollTemplate.findOneAndUpdate({ _id: id, company: req.company }, req.body, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ message: 'Template not found' });
    
    res.status(200).json(updated);
  } catch (error) {
    res.status(400).json({ message: 'Error updating template', error: error.message });
  }
};

exports.deleteTemplate = async (req, res) => {
  try {
    const deleted = await PayrollTemplate.findOneAndDelete({ _id: req.params.id, company: req.company });
    if (!deleted) return res.status(404).json({ message: 'Template not found' });
    
    res.status(200).json({ message: 'Template deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting template', error: error.message });
  }
};

// ----------------------------------------------------
// PAYROLL CONFIGURATION (General & Tax Settings)
// ----------------------------------------------------

exports.getConfiguration = async (req, res) => {
  try {
    let config = await PayrollConfiguration.findOne({ isSingleton: true, company: req.company });
    
    // Auto-seed if missing
    if (!config) {
      config = new PayrollConfiguration({ isSingleton: true, company: req.company });
      await config.save();
    }
    
    res.status(200).json(config);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching payroll configuration', error: error.message });
  }
};

exports.updateConfiguration = async (req, res) => {
  try {
    let config = await PayrollConfiguration.findOne({ isSingleton: true, company: req.company });
    if (!config) {
      config = new PayrollConfiguration({ isSingleton: true, company: req.company, ...req.body });
      await config.save();
    } else {
      Object.assign(config, req.body);
      await config.save();
    }
    
    res.status(200).json(config);
  } catch (error) {
    res.status(400).json({ message: 'Error updating payroll configuration', error: error.message });
  }
};
