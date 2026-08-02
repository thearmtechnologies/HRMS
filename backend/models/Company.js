const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true
  },
  companyCode: {
    type: String,
    required: [true, 'Company code is required'],
    unique: true,
    trim: true,
    uppercase: true,
    validate: {
      validator: function(v) {
        return /^[A-Z0-9_]+$/.test(v);
      },
      message: props => `${props.value} is not a valid company code! Code must only contain alphanumeric characters and underscores (no spaces).`
    }
  },
  companyEmail: {
    type: String,
    required: [true, 'Company email is required'],
    unique: true,
    trim: true,
    lowercase: true
  },
  companyPhone: {
    type: String,
    required: [true, 'Company phone is required'],
    trim: true
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Suspended'],
    default: 'Active'
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  adminCreated: {
    type: Boolean,
    default: false
  },
  primaryAdmin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Company', companySchema);
