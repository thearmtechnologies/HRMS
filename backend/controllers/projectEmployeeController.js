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

    if (!employee && req.user.role !== "admin" && req.user.role !== "hr") {
      return res.status(404).json({ success: false, message: "Employee profile not found." });
    }

    let query = employee ? {
      $or: [
        { projectManager: employee._id },
        { assignedEmployees: employee._id }
      ]
    } : {};
    
    if (req.user.role === "admin" || req.user.role === "hr") {
      query = {}; // Admin and HR see all projects
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

    const openTasksCount = employee ? await Task.countDocuments({
      assignedEmployee: employee._id,
      status: { $ne: "DONE" }
    }) : 0;

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
      currentEmployeeId: employee ? employee._id : null
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
    const isProjectManager = employee && pmId?.toString() === employee._id.toString();
    const isAdmin = req.user.role === "admin" || req.user.role === "hr"; // Check if user is admin or hr
    
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
    if (!taskData.status) taskData.status = "TODO";
    if (taskData.assignedEmployee === "") delete taskData.assignedEmployee;

    const task = await Task.create(taskData);
    const populatedTask = await Task.findById(task._id)
      .populate("assignedEmployee", "employeeId employeeName fullName firstName lastName designation")
      .populate("createdBy", "employeeId fullName firstName lastName email");

    await notify({
      user: task.assignedEmployee || pmId,
      title: "New Task Assigned",
      message: `Task "${task.title}" created in ${project.name}`,
      type: "project",
      link: `/projects/${project._id}`
    });

    res.status(201).json({ success: true, task: populatedTask });
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
    const isAssignedToTask = employee && task.assignedEmployee?.toString() === employee._id.toString();
    const pmId = project.projectManager?._id || project.projectManager;
    const isProjectManager = employee && pmId?.toString() === employee._id.toString();
    const isAdmin = req.user.role === "admin" || req.user.role === "hr";

    if (!isAssignedToTask && !isProjectManager && !isAdmin) {
      return res.status(403).json({ success: false, message: "You can only update your own tasks." });
    }

    const oldStatus = task.status;
    task.status = req.body.status;
    
    // Auto archive if status is DONE
    if (req.body.status === "DONE" && oldStatus !== "DONE") {
      task.isArchived = true;
    } else if (req.body.status !== "DONE" && oldStatus === "DONE") {
      task.isArchived = false;
    }

    if (oldStatus !== req.body.status) {
      task.history.push({
        action: `Status changed to ${req.body.status}`,
        details: `Updated from ${oldStatus}`,
        user: req.user.userId
      });
    }

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

    const populatedTask = await Task.findById(task._id)
      .populate("assignedEmployee", "employeeId employeeName fullName firstName lastName designation")
      .populate("createdBy", "employeeId fullName firstName lastName email");

    res.status(200).json({ success: true, task: populatedTask, projectProgress: project.progressPercentage });
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({ success: false, message: error.message });
  }
};

exports.updateTaskOrders = async (req, res) => {
  try {
    const { updates } = req.body; // Array of { taskId, status, orderIndex }
    if (!Array.isArray(updates)) {
      return res.status(400).json({ success: false, message: "Invalid payload" });
    }

    // Determine project from first task for access check
    if (updates.length > 0) {
      const firstTask = await Task.findById(updates[0].taskId);
      if (firstTask) {
        const { project, employee } = await verifyProjectAccess(req, firstTask.project);
        const pmId = project.projectManager?._id || project.projectManager;
        const isProjectManager = employee && pmId?.toString() === employee._id.toString();
        const isAdmin = req.user.role === "admin" || req.user.role === "hr";
      }
    }

    // Bulk update tasks using Promise.all
    await Promise.all(updates.map(async (update) => {
      const task = await Task.findById(update.taskId);
      if (task) {
        const oldStatus = task.status;
        if (update.status) task.status = update.status;
        if (typeof update.orderIndex === "number") task.orderIndex = update.orderIndex;
        
        // Auto archive logic
        if (task.status === "DONE" && oldStatus !== "DONE") {
          task.isArchived = true;
        } else if (task.status !== "DONE" && oldStatus === "DONE") {
          task.isArchived = false;
        }

        await task.save();
      }
    }));

    res.status(200).json({ success: true, message: "Task orders updated successfully" });
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({ success: false, message: error.message });
  }
};

exports.editTaskDetails = async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) return res.status(404).json({ success: false, message: "Task not found" });

    const { project, employee } = await verifyProjectAccess(req, task.project);

    const pmId = project.projectManager?._id || project.projectManager;
    const isProjectManager = employee && pmId?.toString() === employee._id.toString();
    const isAdmin = req.user.role === "admin" || req.user.role === "hr";

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

    const updatableFields = ["title", "description", "priority", "dueDate", "assignedEmployee", "estimatedHours"];
    updatableFields.forEach(field => {
      if (req.body[field] !== undefined) {
        if (field === "assignedEmployee" && req.body[field] === "") {
          task[field] = null;
        } else {
          task[field] = req.body[field];
        }
      }
    });

    task.history.push({
      action: "Details Updated",
      details: "Task metadata edited by PM/Admin",
      user: req.user.userId
    });

    await task.save();

    const populatedTask = await Task.findById(task._id)
      .populate("assignedEmployee", "employeeId employeeName fullName firstName lastName designation")
      .populate("createdBy", "employeeId fullName firstName lastName email");

    res.status(200).json({ success: true, task: populatedTask });
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
    const isProjectManager = employee && pmId?.toString() === employee._id.toString();
    const isAdmin = req.user.role === "admin" || req.user.role === "hr";

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
      employee: employee ? employee._id : null
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
      sender: employee ? employee._id : null
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

