const Project = require("../models/Project");

// Create a new project
exports.createProject = async (req, res) => {
  try {
    const projectData = { ...req.body };
    // Optionally record who created it
    if (req.user && req.user.id) {
      projectData.createdBy = req.user.id;
    }

    const project = new Project(projectData);
    await project.save();

    res.status(201).json({
      success: true,
      message: "Project created successfully",
      project,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Failed to create project",
      error: error.message,
    });
  }
};

// Get all projects
exports.getAllProjects = async (req, res) => {
  try {
    const { status, search } = req.query;
    let query = {};

    if (status) {
      query.status = status;
    }

    let projects = await Project.find(query)
      .populate("department", "departmentName")
      .populate("projectManager", "employeeId employeeName fullName firstName lastName designation")
      .populate("assignedEmployees", "employeeId employeeName fullName firstName lastName designation department")
      .sort({ createdAt: -1 });

    if (search) {
      const s = search.toLowerCase();
      projects = projects.filter(p => {
        return (
          p.projectName?.toLowerCase().includes(s) ||
          p.projectCode?.toLowerCase().includes(s)
        );
      });
    }

    res.status(200).json({
      success: true,
      projects,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch projects",
      error: error.message,
    });
  }
};

// Get single project
exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("department", "departmentName")
      .populate("projectManager", "employeeId employeeName fullName firstName lastName designation")
      .populate("assignedEmployees", "employeeId employeeName fullName firstName lastName designation department");

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    res.status(200).json({
      success: true,
      project,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch project",
      error: error.message,
    });
  }
};

// Update project
exports.updateProject = async (req, res) => {
  try {
    const updateData = { ...req.body };
    
    if (req.user && req.user.id) {
      updateData.updatedBy = req.user.id;
    }

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    // Assign fields
    Object.keys(updateData).forEach((key) => {
      project[key] = updateData[key];
    });

    await project.save(); // triggers pre-save validation

    const updatedProject = await Project.findById(req.params.id)
      .populate("department", "departmentName")
      .populate("projectManager", "employeeId employeeName fullName firstName lastName designation")
      .populate("assignedEmployees", "employeeId employeeName fullName firstName lastName designation department");

    res.status(200).json({
      success: true,
      message: "Project updated successfully",
      project: updatedProject,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Failed to update project",
      error: error.message,
    });
  }
};

// Archive project
exports.archiveProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { status: "Archived" },
      { new: true }
    );

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    res.status(200).json({
      success: true,
      message: "Project archived successfully",
      project,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to archive project",
      error: error.message,
    });
  }
};

// Delete project (hard delete)
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    res.status(200).json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete project",
      error: error.message,
    });
  }
};
