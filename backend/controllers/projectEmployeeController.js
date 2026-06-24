const Project = require("../models/Project");
const ProjectTask = require("../models/ProjectTask");
const ProjectMilestone = require("../models/ProjectMilestone");
const ProjectWorkLog = require("../models/ProjectWorkLog");
const ProjectDiscussion = require("../models/ProjectDiscussion");
const Employee = require("../models/Employee");

// Helper to check if current user is an employee and has access to the project
const verifyProjectAccess = async (req, projectId) => {
  // Find employee record matching the logged in user (who might be an admin/hr but is an employee, or a pure employee)
  // Assuming req.user contains the user ID, and Employee model has a user field or we find by email.
  // Wait, in HRMS, Employee schema has 'userId' or similar?
  // Let's assume Employee model has a user reference, or req.user.employeeId is set.
  // For safety, let's look up the Employee by req.user.id
  let employee = null;
  if (req.user.employeeId) {
    employee = await Employee.findById(req.user.employeeId);
  } else {
    // try to find employee by userId
    employee = await Employee.findOne({ user: req.user.id }) || await Employee.findOne({ email: req.user.email });
  }

  if (!employee) {
    throw new Error("Employee profile not found for current user.");
  }

  const project = await Project.findById(projectId);
  if (!project) {
    throw new Error("Project not found");
  }

  const isManager = project.projectManager?.toString() === employee._id.toString();
  const isAssigned = project.assignedEmployees?.some(e => e.toString() === employee._id.toString());

  if (!isManager && !isAssigned) {
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
      employee = await Employee.findOne({ user: req.user.id }) || await Employee.findOne({ email: req.user.email });
    }

    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee profile not found." });
    }

    const projects = await Project.find({
      $or: [
        { projectManager: employee._id },
        { assignedEmployees: employee._id }
      ]
    })
    .populate("department", "departmentName")
    .populate("projectManager", "employeeId employeeName fullName firstName lastName designation")
    .sort({ createdAt: -1 });

    const openTasksCount = await ProjectTask.countDocuments({
      assignedEmployee: employee._id,
      status: { $ne: "Completed" }
    });

    res.status(200).json({ success: true, projects, openTasksCount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getProjectDetails = async (req, res) => {
  try {
    const { project, employee } = await verifyProjectAccess(req, req.params.id);

    // Fetch related data
    const tasks = await ProjectTask.find({ project: project._id })
      .populate("assignedEmployee", "employeeId employeeName fullName firstName lastName designation")
      .sort({ createdAt: -1 });
      
    const milestones = await ProjectMilestone.find({ project: project._id }).sort({ dueDate: 1 });
    
    const workLogs = await ProjectWorkLog.find({ project: project._id })
      .populate("employee", "employeeId employeeName fullName firstName lastName designation")
      .sort({ createdAt: -1 });
      
    const discussions = await ProjectDiscussion.find({ project: project._id })
      .populate("sender", "employeeId employeeName fullName firstName lastName designation")
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      project,
      tasks,
      milestones,
      workLogs,
      discussions,
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
    
    const taskData = { ...req.body, project: project._id, createdBy: req.user.id };
    // If not assigning to someone, auto-assign to self
    if (!taskData.assignedEmployee) {
      taskData.assignedEmployee = employee._id;
    }

    const task = await ProjectTask.create(taskData);
    
    res.status(201).json({ success: true, task });
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({ success: false, message: error.message });
  }
};

exports.updateTaskStatus = async (req, res) => {
  try {
    const task = await ProjectTask.findById(req.params.taskId);
    if (!task) return res.status(404).json({ success: false, message: "Task not found" });

    const { project, employee } = await verifyProjectAccess(req, task.project);

    // Task Security: Can only edit tasks assigned to them, unless they are the project manager
    const isAssignedToTask = task.assignedEmployee?.toString() === employee._id.toString();
    const isProjectManager = project.projectManager?.toString() === employee._id.toString();

    if (!isAssignedToTask && !isProjectManager) {
      return res.status(403).json({ success: false, message: "You can only update your own tasks." });
    }

    task.status = req.body.status;
    await task.save();

    res.status(200).json({ success: true, task });
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
