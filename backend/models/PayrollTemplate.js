const mongoose = require('mongoose');

const payrollTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Template name is required'],
    trim: true
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  components: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SalaryComponent'
  }],
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

payrollTemplateSchema.index({ name: 1, company: 1 }, { unique: true });

module.exports = mongoose.model('PayrollTemplate', payrollTemplateSchema);
