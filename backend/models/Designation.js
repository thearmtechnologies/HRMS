const mongoose = require('mongoose');

const DesignationSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    trim: true
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  updatedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  }
}, { timestamps: true });

DesignationSchema.index({ name: 1, company: 1 }, { unique: true });

const Designation = mongoose.model('Designation', DesignationSchema);
module.exports = Designation;
