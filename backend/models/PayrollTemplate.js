const mongoose = require('mongoose');

const payrollTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Template name is required'],
    unique: true,
    trim: true
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

module.exports = mongoose.model('PayrollTemplate', payrollTemplateSchema);
