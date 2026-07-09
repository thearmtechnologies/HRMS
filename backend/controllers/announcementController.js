const Announcement = require('../models/Announcement');
const Employee = require('../models/Employee');
const { createMultipleNotifications } = require('../utils/notificationService');

// Create and publish a new announcement
const createAnnouncement = async (req, res) => {
  try {
    const { title, content, priority, targetDepartments } = req.body;
    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Title and content are required' });
    }

    const announcement = await Announcement.create({
      title,
      content,
      priority: priority || 'medium',
      targetDepartments: targetDepartments || [],
      publishedBy: req.user ? req.user.userId : null
    });

    // Find target employees to notify
    let query = { isActive: true };
    if (targetDepartments && targetDepartments.length > 0) {
      query.department = { $in: targetDepartments };
    }
    const employees = await Employee.find(query).select('user').lean();

    const notifs = [];
    for (const emp of employees) {
      if (!emp.user) continue;
      notifs.push({
        recipient: emp.user,
        sender: req.user ? req.user.userId : null,
        title: 'New Announcement Published',
        message: `[${priority?.toUpperCase() || 'ANNOUNCEMENT'}] ${title}: ${content.substring(0, 100)}${content.length > 100 ? '...' : ''}`,
        type: 'announcement',
        module: 'announcements',
        priority: priority || 'medium',
        link: '/employee/announcements'
      });
    }

    if (notifs.length > 0) {
      createMultipleNotifications(notifs).catch(e => console.error('Announcement notification error:', e));
    }

    return res.status(201).json({ success: true, message: 'Announcement created and broadcasted', announcement });
  } catch (error) {
    console.error('❌ Error creating announcement:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
  }
};

// Get all active announcements
const getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find({ isActive: true })
      .populate('publishedBy', 'firstName lastName fullName email')
      .sort({ publishedAt: -1 });
    return res.status(200).json({ success: true, announcements });
  } catch (error) {
    console.error('❌ Error fetching announcements:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

module.exports = {
  createAnnouncement,
  getAnnouncements
};
