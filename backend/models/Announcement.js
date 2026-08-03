const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  summary: { type: String, trim: true },
  content: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['General', 'Important', 'Urgent', 'Holiday', 'Policy', 'Event', 'Maintenance', 'Information'], 
    default: 'General' 
  },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  audience: { type: String, enum: ['Company', 'Department', 'Employee'], default: 'Company' },
  targetDepartments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Department' }],
  targetEmployees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }],
  status: { type: String, enum: ['Draft', 'Published', 'Scheduled', 'Archived', 'Expired'], default: 'Draft' },
  publishedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  publishedAt: { type: Date },
  scheduledPublishDate: { type: Date },
  expiryDate: { type: Date },
  attachments: [{
    name: String,
    url: String,
    type: String
  }],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Announcement', announcementSchema);
