const mongoose = require('mongoose');

const permissionSchema = new mongoose.Schema({
  module: { type: String, required: true },
  view: { type: Boolean, default: false },
  create: { type: Boolean, default: false },
  edit: { type: Boolean, default: false },
  delete: { type: Boolean, default: false },
  approve: { type: Boolean, default: false },
  export: { type: Boolean, default: false },
  regularize: { type: Boolean, default: false },
  generate: { type: Boolean, default: false },
  mark_paid: { type: Boolean, default: false },
  assign: { type: Boolean, default: false },
  archive: { type: Boolean, default: false }
}, { _id: false });

const roleSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    lowercase: true // e.g. "admin", "hr"
  },
  displayName: {
    type: String,
    required: true,
    trim: true // e.g. "Admin", "HR"
  },
  isSystem: { 
    type: Boolean, 
    default: false 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  permissions: [permissionSchema],
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  updatedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }
}, { timestamps: true });

const Role = mongoose.model('Role', roleSchema);
module.exports = Role;
