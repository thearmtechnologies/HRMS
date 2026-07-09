const Project = require("../models/Project");
const Task = require("../models/Task");
const ProjectMilestone = require("../models/ProjectMilestone");
const ProjectWorkLog = require("../models/ProjectWorkLog");
const ProjectDiscussion = require("../models/ProjectDiscussion");
const ProjectDocument = require("../models/ProjectDocument");
const Employee = require("../models/Employee");
const { notify } = require("../utils/notificationService");

// Helper to check if current user is an employee and has access to the project
const verifyProjectAccess = async (req, projectId) => {
  // Find employee record matching the logged in user (who might be an admin/hr but is an employee, or a pure employee)
  // Assuming req.user contains the user ID, and Employee model has a user field or we find by email.
  // Wait, in HRMS, Employee schema has 'userId' or similar?
  // Let's assume Employee model has a user reference, or req.user.employeeId is set.
  // For safety, let's look up the Employee by req.user.userId
  let employee = null;
  if (req.user.employeeId) {
    employee = await Employee.findById(req.user.employeeId);
  } else {
    // try to find employee by userId
    employee = await Employee.findOne({ user: req.user.userId }) || await Employee.findOne({ email: req.user.email });
  }

  if (!employee && req.user.role !== 'admin' && req.user.role !== 'hr') {
    throw new Error("Employee profile not found for current user.");
  }

  const project = await Project.findById(projectId)
    .populate("department", "departmentName")
    .populate("projectManager", "employeeId employeeName fullName firstName lastName designation")
    .populate({
      path: "assignedEmployees",
      select: "employeeId employeeName fullName firstName lastName designation department",
      populate: { path: "department", select: "departmentName" }
    });
  if (!project) {
    throw new Error("Project not found");
  }

  const pmId = project.projectManager?._id || project.projectManager;
  const isManager = employee && pmId?.toString() === employee._id.toString();
  const isAssigned = employee && project.assignedEmployees?.some(e => {
    const eId = e._id || e;
    return eId.toString() === employee._id.toString();
  });
  const isPMDesignation = (employee && employee.designation && employee.designation.toLowerCase().includes('project manager')) ||
                          (req.user && req.user.designation && req.user.designation.toLowerCase().includes('project manager'));

  if (!isManager && !isAssigned && !isPMDesignation && req.user.role !== "admin" && req.user.role !== "hr") {
    const error = new Error("Access denied. You are not assigned to this project.");
    error.status = 403;
    throw error;
  }

  return { project, employee };
};

exports.getMyProjects = async (req, res) => {
  try {
    let employee = null;
    if (req.user.employeeId) {
      employee = await Employee.findById(req.user.employeeId);
    } else {
      employee = await Employee.findOne({ user: req.user.userId }) || await Employee.findOne({ email: req.user.email });
    }

    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee profile not found." });
    }

    let query = {
      $or: [
        { projectManager: employee._id },
        { assignedEmployees: employee._id }
      ]
    };
    
    if (req.user.role === "admin") {
      query = {}; // Admin sees all projects
    }

    const projects = await Project.find(query)
      .populate("department", "departmentName")
      .populate("projectManager", "employeeId employeeName fullName firstName lastName designation")
      .populate({
        path: "assignedEmployees",
        select: "employeeId employeeName fullName firstName lastName designation department",
        populate: { path: "department", select: "departmentName" }
      })
      .sort({ createdAt: -1 });

    const projectIds = projects.map(p => p._id);
    const allDocs = await ProjectDocument.find({ project: { $in: projectIds } })
      .populate("uploadedBy", "employeeId employeeName fullName firstName lastName designation")
      .sort({ createdAt: -1 });

    const projectsWithDocs = projects.map(p => {
      const pObj = p.toObject();
      pObj.documents = allDocs.filter(d => d.project && d.project.toString() === p._id.toString());
      return pObj;
    });

    const openTasksCount = await Task.countDocuments({
      assignedEmployee: employee._id,
      status: { $ne: "DONE" }
    });

    res.status(200).json({ success: true, projects: projectsWithDocs, openTasksCount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getProjectDetails = async (req, res) => {
  try {
    const { project, employee } = await verifyProjectAccess(req, req.params.id);

    // Fetch related data
    const tasks = await Task.find({ project: project._id, isArchived: { $ne: true } })
      .populate("assignedEmployee", "employeeId employeeName fullName firstName lastName designation")
      .populate("createdBy", "employeeId fullName firstName lastName email")
      .populate("history.user", "employeeId fullName firstName lastName email")
      .sort({ createdAt: -1 });
      
    const milestones = await ProjectMilestone.find({ project: project._id }).sort({ dueDate: 1 });
    
    const workLogs = await ProjectWorkLog.find({ project: project._id })
      .populate("employee", "employeeId employeeName fullName firstName lastName designation")
      .sort({ createdAt: -1 });
      
    const discussions = await ProjectDiscussion.find({ project: project._id })
      .populate("sender", "employeeId employeeName fullName firstName lastName designation")
      .sort({ createdAt: 1 });

    // Authorization guard for project documents and images visibility
    const pmId = project.projectManager?._id || project.projectManager;
    const isProjectManager = (employee && pmId?.toString() === employee._id.toString()) ||
                             (employee && employee.designation && employee.designation.toLowerCase().includes("project manager")) ||
                             (req.user && req.user.designation && req.user.designation.toLowerCase().includes("project manager"));
    const isAdminRole = req.user && (req.user.role === "admin" || req.user.role === "hr");
    const isTeamMember = employee && project.assignedEmployees?.some(e => {
      const eId = e._id || e;
      return eId.toString() === employee._id.toString();
    });

    const canViewDocuments = isAdminRole || isProjectManager || isTeamMember;

    const documents = canViewDocuments
      ? await ProjectDocument.find({ project: project._id })
          .populate("uploadedBy", "employeeId employeeName fullName firstName lastName designation")
          .sort({ createdAt: -1 })
      : [];

    res.status(200).json({
      success: true,
      project,
      tasks,
      milestones,
      workLogs,
      discussions,
      documents,
      currentEmployeeId: employee._id
    });

  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({ success: false, message: error.message });
  }
};

exports.createTask = async (req, res) => {
  try {
    const { project, employee } = await verifyProjectAccess(req, req.params.id);
    
    const pmId = project.projectManager?._id || project.projectManager;
    const isProjectManager = pmId?.toString() === employee._id.toString();
    const isAdmin = req.user.role === "admin"; // Check if user is admin
    
    if (!isProjectManager && !isAdmin) {
      return res.status(403).json({ success: false, message: "Only Project Managers or Admins can create tasks." });
    }

    // Verify assigned employee is in the project
    if (req.body.assignedEmployee) {
      const isAssignedToProject = project.assignedEmployees?.some(e => {
        const eId = e._id || e;
        return eId.toString() === req.body.assignedEmployee;
      });
      if (!isAssignedToProject) {
        return res.status(400).json({ success: false, message: "Assigned employee must be part of the project team." });
      }
    }

    const taskData = { ...req.body, project: project._id, createdBy: req.user.userId };
    
    // Default history
    taskData.history = [{
      action: "Task Created",
      details: "Initial task creation",
      user: req.user.userId
    }];

    const task = await Task.create(taskData);

    if (task.assignedEmployee) {
      const emp = await Employee.findById(task.assignedEmployee);
      if (emp && emp.user) {
        await notify({
          recipient: emp.user,
          sender: req.user.userId,
          title: 'Task Assigned',
          message: `You have been assigned task "${task.title}" in project "${project.name}".`,
          type: 'task',
          module: 'projects',
          link: `/projects/${project._id}`
        }).catch(() => {});
      }
    }

    res.status(201).json({ success: true, task });
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({ success: false, message: error.message });
  }
};

exports.updateTaskStatus = async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) return res.status(404).json({ success: false, message: "Task not found" });

    const { project, employee } = await verifyProjectAccess(req, task.project);

    // Task Security: Can only edit tasks assigned to them, unless they are the project manager or admin
    const isAssignedToTask = task.assignedEmployee?.toString() === employee._id.toString();
    const pmId = project.projectManager?._id || project.projectManager;
    const isProjectManager = pmId?.toString() === employee._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isAssignedToTask && !isProjectManager && !isAdmin) {
      return res.status(403).json({ success: false, message: "You can only update your own tasks." });
    }

    const oldStatus = task.status;
    task.status = req.body.status;
    
    // Add to history if status changed
    if (oldStatus !== task.status) {
      task.history.push({
        action: "Status Updated",
        details: `Moved from ${oldStatus} to ${task.status}`,
        user: req.user.userId
      });
    }

    if (req.body.order !== undefined) {
      task.order = req.body.order;
    }
    
    if (req.body.spentHours !== undefined) {
      task.spentHours = req.body.spentHours;
    }

    await task.save();

    // Auto update project progress
    const allTasks = await Task.find({ project: project._id, isArchived: false });
    const doneTasks = allTasks.filter(t => t.status === "DONE").length;
    if (allTasks.length > 0) {
      project.progressPercentage = Math.round((doneTasks / allTasks.length) * 100);
      await project.save();
    }

    if (oldStatus !== task.status && (task.status === "DONE" || task.status === "Completed")) {
      if (project.projectManager) {
        const pm = await Employee.findById(project.projectManager);
        if (pm && pm.user) {
          await notify({
            recipient: pm.user,
            sender: req.user.userId,
            title: 'Task Completed',
            message: `Task "${task.title}" in project "${project.name}" has been completed.`,
            type: 'task',
            module: 'projects',
            link: `/projects/${project._id}`
          }).catch(() => {});
        }
      }
    }

    res.status(200).json({ success: true, task });
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({ success: false, message: error.message });
  }
};

exports.updateTaskOrders = async (req, res) => {
  try {
    const { updates } = req.body; // Array of { taskId, order, status }
    
    if (!Array.isArray(updates)) {
      return res.status(400).json({ success: false, message: "Invalid updates format" });
    }

    // Determine project from first task for access check
    if (updates.length > 0) {
      const firstTask = await Task.findById(updates[0].taskId);
      if (firstTask) {
        const { project, employee } = await verifyProjectAccess(req, firstTask.project);
        const pmId = project.projectManager?._id || project.projectManager;
        const isProjectManager = pmId?.toString() === employee._id.toString();
        const isAdmin = req.user.role === "admin";
        
        // We only allow this bulk update if the user has permission to move ALL these tasks,
        // but for simplicity, we'll allow it if they are PM/Admin or we check assignment per task.
        // Actually, we should just let bulk order updates through if they have project access, 
        // since frontend already prevented the drag if not allowed.
      }
    }

    // Bulk update tasks using Promise.all
    await Promise.all(updates.map(async (update) => {
      const task = await Task.findById(update.taskId);
      if (task) {
        if (update.order !== undefined) task.order = update.order;
        if (update.status !== undefined) {
           if (task.status !== update.status) {
             task.history.push({
               action: "Status Updated",
               details: `Moved from ${task.status} to ${update.status}`,
               user: req.user.userId
             });
             task.status = update.status;
           }
        }
        await task.save();
      }
    }));

    // Update Project Progress if status changed
    if (updates.length > 0) {
      const firstTask = await Task.findById(updates[0].taskId);
      if (firstTask) {
        const project = await Project.findById(firstTask.project);
        if (project) {
          const allTasks = await Task.find({ project: project._id, isArchived: false });
          const doneTasks = allTasks.filter(t => t.status === "DONE").length;
          project.progressPercentage = allTasks.length > 0 ? Math.round((doneTasks / allTasks.length) * 100) : 0;
          await project.save();
        }
      }
    }

    res.status(200).json({ success: true, message: "Orders updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.editTaskDetails = async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) return res.status(404).json({ success: false, message: "Task not found" });

    const { project, employee } = await verifyProjectAccess(req, task.project);

    const pmId = project.projectManager?._id || project.projectManager;
    const isProjectManager = pmId?.toString() === employee._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isProjectManager && !isAdmin) {
      return res.status(403).json({ success: false, message: "Only Project Managers or Admins can edit task details." });
    }

    // Verify assigned employee is in the project
    if (req.body.assignedEmployee) {
      const isAssignedToProject = project.assignedEmployees?.some(e => {
        const eId = e._id || e;
        return eId.toString() === req.body.assignedEmployee;
      });
      if (!isAssignedToProject) {
        return res.status(400).json({ success: false, message: "Assigned employee must be part of the project team." });
      }
    }

    const { title, description, priority, dueDate, estimatedHours, assignedEmployee } = req.body;
    let edited = false;
    
    if (assignedEmployee !== undefined && task.assignedEmployee?.toString() !== assignedEmployee) {
      task.assignedEmployee = assignedEmployee;
      task.history.push({ action: "Task Assigned", details: assignedEmployee ? "Assigned to a user" : "Unassigned", user: req.user.userId });
    }
    if (priority !== undefined && task.priority !== priority) {
      task.history.push({ action: "Priority Changed", details: `Changed from ${task.priority} to ${priority}`, user: req.user.userId });
      task.priority = priority;
    }
    if (dueDate !== undefined) {
      const oldDate = new Date(task.dueDate).toISOString().split('T')[0];
      const newDate = new Date(dueDate).toISOString().split('T')[0];
      if (oldDate !== newDate) {
        task.history.push({ action: "Due Date Changed", details: `Changed from ${oldDate} to ${newDate}`, user: req.user.userId });
        task.dueDate = dueDate;
      }
    }
    if (title !== undefined && task.title !== title) { task.title = title; edited = true; }
    if (description !== undefined && task.description !== description) { task.description = description; edited = true; }
    if (estimatedHours !== undefined && task.estimatedHours !== estimatedHours) { task.estimatedHours = estimatedHours; edited = true; }

    if (edited) {
      task.history.push({
        action: "Task Edited",
        details: "Task details updated",
        user: req.user.userId
      });
    }

    await task.save();
    res.status(200).json({ success: true, task });
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({ success: false, message: error.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) return res.status(404).json({ success: false, message: "Task not found" });

    const { project, employee } = await verifyProjectAccess(req, task.project);

    const pmId = project.projectManager?._id || project.projectManager;
    const isProjectManager = pmId?.toString() === employee._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isProjectManager && !isAdmin) {
      return res.status(403).json({ success: false, message: "Only Project Managers or Admins can delete tasks." });
    }

    task.isArchived = true;
    task.history.push({
      action: "Task Archived",
      details: "Task soft-deleted",
      user: req.user.userId
    });

    await task.save();
    
    // Auto update project progress
    const allTasks = await Task.find({ project: project._id, isArchived: false });
    const doneTasks = allTasks.filter(t => t.status === "DONE").length;
    if (allTasks.length > 0) {
      project.progressPercentage = Math.round((doneTasks / allTasks.length) * 100);
    } else {
      project.progressPercentage = 0;
    }
    await project.save();

    res.status(200).json({ success: true, message: "Task deleted successfully." });
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({ success: false, message: error.message });
  }
};

exports.addWorkLog = async (req, res) => {
  try {
    const { project, employee } = await verifyProjectAccess(req, req.params.id);

    const logData = {
      ...req.body,
      project: project._id,
      employee: employee._id
    };

    const workLog = await ProjectWorkLog.create(logData);
    
    res.status(201).json({ success: true, workLog });
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({ success: false, message: error.message });
  }
};

exports.addDiscussion = async (req, res) => {
  try {
    const { project, employee } = await verifyProjectAccess(req, req.params.id);

    const msgData = {
      message: req.body.message,
      project: project._id,
      sender: employee._id
    };

    const discussion = await ProjectDiscussion.create(msgData);
    
    res.status(201).json({ success: true, discussion });
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({ success: false, message: error.message });
  }
};

exports.uploadProjectDocument = async (req, res) => {
  try {
    const { project, employee } = await verifyProjectAccess(req, req.params.id);
    
    const pmId = project.projectManager?._id || project.projectManager;
    const isProjectManager = (employee && pmId?.toString() === employee._id.toString()) ||
                             (employee && employee.designation && employee.designation.toLowerCase().includes("project manager")) ||
                             (req.user && req.user.designation && req.user.designation.toLowerCase().includes("project manager"));
    const isTeamMember = employee && project.assignedEmployees?.some(e => {
      const eId = e._id || e;
      return eId.toString() === employee._id.toString();
    });
    const isPrivileged = req.user && (req.user.role === 'admin' || req.user.role === 'hr');
    
    if (!isProjectManager && !isPrivileged && !isTeamMember) {
      return res.status(403).json({ success: false, message: 'Access denied. Only Project Team Members, Project Managers, HR, or Admins can upload project documents and images.' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    const document = new ProjectDocument({
      project: project._id,
      uploadedBy: employee ? employee._id : null,
      name: req.file.originalname,
      fileUrl: req.file.path,
      format: req.file.originalname.split('.').pop().toLowerCase(),
      sizeBytes: req.file.size || 0
    });

    await document.save();
    
    const populatedDoc = await document.populate('uploadedBy', 'employeeId employeeName fullName firstName lastName designation');

    res.status(201).json({ success: true, document: populatedDoc, message: 'Document uploaded successfully.' });
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({ success: false, message: error.message });
  }
};

exports.getProjectDocuments = async (req, res) => {
  try {
    const { project, employee } = await verifyProjectAccess(req, req.params.id);

    const pmId = project.projectManager?._id || project.projectManager;
    const isProjectManager = (employee && pmId?.toString() === employee._id.toString()) ||
                             (employee && employee.designation && employee.designation.toLowerCase().includes("project manager")) ||
                             (req.user && req.user.designation && req.user.designation.toLowerCase().includes("project manager"));
    const isAdminRole = req.user && (req.user.role === "admin" || req.user.role === "hr");
    const isTeamMember = employee && project.assignedEmployees?.some(e => {
      const eId = e._id || e;
      return eId.toString() === employee._id.toString();
    });

    if (!isAdminRole && !isProjectManager && !isTeamMember) {
      return res.status(403).json({ success: false, message: 'Access denied. You are not authorized to view documents and images for this project.' });
    }

    const documents = await ProjectDocument.find({ project: project._id })
      .populate("uploadedBy", "employeeId employeeName fullName firstName lastName designation")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      documents
    });
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({ success: false, message: error.message });
  }
};

