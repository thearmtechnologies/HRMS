const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  action: { 
    type: String, 
    required: true,
    enum: ['CREATE_ROLE', 'UPDATE_ROLE', 'DEACTIVATE_ROLE', 'ACTIVATE_ROLE', 'CREATE_DESIGNATION', 'UPDATE_DESIGNATION', 'DEACTIVATE_DESIGNATION', 'ACTIVATE_DESIGNATION', 'UPDATE_PERMISSIONS', 'UPDATE_USER_PERMISSIONS', 'OTHER']
  },
  entityType: { 
    type: String, 
    required: true,
    enum: ['Role', 'Designation', 'System', 'User']
  },
  entityId: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true,
    refPath: 'entityType' // dynamic reference
  },
  changedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  },
  oldValue: { 
    type: mongoose.Schema.Types.Mixed 
  },
  newValue: { 
    type: mongoose.Schema.Types.Mixed 
  },
  description: {
    type: String
  }
}, { timestamps: true });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);
module.exports = AuditLog;
