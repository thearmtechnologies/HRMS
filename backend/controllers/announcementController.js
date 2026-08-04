const Announcement = require('../models/Announcement');
const Employee = require('../models/Employee');
const { createMultipleNotifications } = require('../utils/notificationService');
const { createCompanyRecord, findCompanyRecords, updateCompanyRecord, deleteCompanyRecord, findOneCompanyRecord } = require("../utils/tenantUtils");

// Helper to broadcast notifications
const notifyEmployees = async (announcement, senderId, companyId) => {
  let query = { isActive: true };
  
  if (announcement.audience === 'Department' && announcement.targetDepartments?.length > 0) {
    query.department = { $in: announcement.targetDepartments };
  } else if (announcement.audience === 'Employee' && announcement.targetEmployees?.length > 0) {
    query._id = { $in: announcement.targetEmployees };
  }
  
  const employees = await findCompanyRecords(Employee, query, companyId, { path: 'user', select: '' });
  
  const notifs = [];
  for (const emp of employees) {
    if (!emp.user) continue;
    notifs.push({
      recipient: emp.user,
      sender: senderId,
      title: 'New Announcement: ' + announcement.title,
      message: `[${announcement.priority?.toUpperCase() || 'ANNOUNCEMENT'}] ${announcement.summary || announcement.content.substring(0, 100)}`,
      type: 'announcement',
      module: 'announcements',
      priority: announcement.priority || 'medium',
      link: '/employee-dashboard?tab=announcements'
    });
  }

  if (notifs.length > 0) {
    createMultipleNotifications(notifs).catch(e => console.error('Announcement notification error:', e));
  }
};

// Create a new announcement
const createAnnouncement = async (req, res) => {
  try {
    const { title, summary, content, type, priority, audience, targetDepartments, targetEmployees, status, scheduledPublishDate, expiryDate, attachments } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Title and content are required' });
    }

    const newStatus = status || 'Draft';
    let publishedAt = null;
    if (newStatus === 'Published') {
      publishedAt = new Date();
    }

    const announcement = await createCompanyRecord(Announcement, {
      title, summary, content, type, priority, audience,
      targetDepartments: targetDepartments || [],
      targetEmployees: targetEmployees || [],
      status: newStatus,
      publishedBy: req.user ? req.user.userId : null,
      publishedAt,
      scheduledPublishDate,
      expiryDate,
      attachments: attachments || [],
      isActive: newStatus !== 'Archived'
    }, req.company);

    if (newStatus === 'Published') {
      await notifyEmployees(announcement, req.user ? req.user.userId : null, req.company);
    }

    return res.status(201).json({ success: true, message: 'Announcement created successfully', announcement });
  } catch (error) {
    console.error('❌ Error creating announcement:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
  }
};

// Update an announcement
const updateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, summary, content, type, priority, audience, targetDepartments, targetEmployees, status, scheduledPublishDate, expiryDate, attachments } = req.body;

    const announcement = await findOneCompanyRecord(Announcement, { _id: id }, req.company);
    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }

    let publishedAt = announcement.publishedAt;
    let justPublished = false;

    // If changing status to Published from something else
    if (status === 'Published' && announcement.status !== 'Published') {
      publishedAt = new Date();
      justPublished = true;
    }

    const updated = await updateCompanyRecord(Announcement, id, req.company, {
      title, summary, content, type, priority, audience,
      targetDepartments: targetDepartments || [],
      targetEmployees: targetEmployees || [],
      status,
      publishedAt,
      scheduledPublishDate,
      expiryDate,
      attachments: attachments || [],
      isActive: status !== 'Archived'
    }, { new: true });

    if (justPublished) {
      await notifyEmployees(updated, req.user ? req.user.userId : null, req.company);
    }

    return res.status(200).json({ success: true, message: 'Announcement updated successfully', announcement: updated });
  } catch (error) {
    console.error('❌ Error updating announcement:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// Delete an announcement
const deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const announcement = await deleteCompanyRecord(Announcement, id, req.company);
    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }
    return res.status(200).json({ success: true, message: 'Announcement deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting announcement:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// Get all announcements (For Admins/HR)
const getAnnouncements = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const announcements = await Announcement.find(filter)
      .populate('publishedBy', 'firstName lastName fullName email')
      .populate('targetDepartments', 'name')
      .populate('targetEmployees', 'firstName lastName')
      .sort({ createdAt: -1 });
    return res.status(200).json({ success: true, announcements });
  } catch (error) {
    console.error('❌ Error fetching announcements:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// Get targeted announcements for an employee
const getMyAnnouncements = async (req, res) => {
  try {
    // Need to find the employee profile for the current user
    const employee = await Employee.findOne({ user: req.user.userId }).lean();
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee profile not found' });
    }

    const filter = {
      status: 'Published',
      $or: [
        { audience: 'Company' },
        { audience: 'Department', targetDepartments: employee.department },
        { audience: 'Employee', targetEmployees: employee._id }
      ]
    };

    // Filter out expired announcements
    filter.$and = [
      { $or: [{ expiryDate: { $exists: false } }, { expiryDate: null }, { expiryDate: { $gte: new Date() } }] }
    ];

    const announcements = await Announcement.find(filter)
      .populate('publishedBy', 'firstName lastName fullName email')
      

    return res.status(200).json({ success: true, announcements });
  } catch (error) {
    console.error('❌ Error fetching employee announcements:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

module.exports = {
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  getAnnouncements,
  getMyAnnouncements
};
