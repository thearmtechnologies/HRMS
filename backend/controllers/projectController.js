const Project = require("../models/Project");
const Employee = require("../models/Employee");
const Department = require("../models/Department");
const ProjectDocument = require("../models/ProjectDocument");
const { notify } = require("../utils/notificationService");
const { createCompanyRecord, findCompanyRecords, updateCompanyRecord, deleteCompanyRecord, findOneCompanyRecord } = require("../utils/tenantUtils");

// Create a new project
exports.createProject = async (req, res) => {
  try {
    const projectData = { ...req.body };
    // Optionally record who created it
    if (req.user && (req.user.userId || req.user.id)) {
      projectData.createdBy = req.user.userId || req.user.id;
    }

    // Relationship validation
    if (projectData.department) {
      const dept = await findOneCompanyRecord(Department, { _id: projectData.department }, req.company);
      if (!dept) return res.status(400).json({ success: false, message: "Invalid Department for this company." });
    }

    if (projectData.projectManager) {
      const pm = await findOneCompanyRecord(Employee, { _id: projectData.projectManager }, req.company);
      if (!pm) return res.status(400).json({ success: false, message: "Invalid Project Manager for this company." });
    }

    if (projectData.assignedEmployees && projectData.assignedEmployees.length > 0) {
      const emps = await findCompanyRecords(Employee, { _id: { $in: projectData.assignedEmployees } }, req.company);
      if (emps.length !== projectData.assignedEmployees.length) {
        return res.status(400).json({ success: false, message: "One or more assigned employees do not belong to this company." });
      }
    }

    const project = await createCompanyRecord(Project, projectData, req.company);

    if (project.assignedEmployees && project.assignedEmployees.length > 0) {
      for (const empId of project.assignedEmployees) {
        const emp = await findOneCompanyRecord(Employee, { _id: empId }, req.company);
        if (emp && emp.user) {
          await notify({
            recipient: emp.user,
            sender: req.user?.userId || req.user?.id || null,
            title: 'Project Assigned',
            message: `You have been assigned to project "${project.projectName || project.name}".`,
            type: 'project',
            module: 'projects',
            link: `/projects/${project._id}`
          }).catch(() => {});
        }
      }
    }

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

    let projects = await findCompanyRecords(Project, query, req.company, [
        { path: "department", select: "departmentName" },
        { path: "projectManager", select: "employeeId employeeName fullName firstName lastName designation" },
        { path: "assignedEmployees", select: "employeeId employeeName fullName firstName lastName designation department" }
    ], { createdAt: -1 });

    if (search) {
      const s = search.toLowerCase();
      projects = projects.filter(p => {
        return (
          p.projectName?.toLowerCase().includes(s) ||
          p.projectCode?.toLowerCase().includes(s)
        );
      });
    }

    // Docs are tied to project, we filter by projectIds which are scoped
    const projectIds = projects.map(p => p._id);
    const allDocs = await ProjectDocument.find({ project: { $in: projectIds } })
      .populate("uploadedBy", "employeeId employeeName fullName firstName lastName designation")
      .sort({ createdAt: -1 });

    const projectsWithDocs = projects.map(p => {
      const pObj = p.toObject();
      pObj.documents = allDocs.filter(d => d.project && d.project.toString() === p._id.toString());
      return pObj;
    });

    res.status(200).json({
      success: true,
      projects: projectsWithDocs,
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
    const project = await findOneCompanyRecord(Project, { _id: req.params.id }, req.company, [
        { path: "department", select: "departmentName" },
        { path: "projectManager", select: "employeeId employeeName fullName firstName lastName designation" },
        { path: "assignedEmployees", select: "employeeId employeeName fullName firstName lastName designation department" }
    ]);

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    const docs = await ProjectDocument.find({ project: project._id })
      .populate("uploadedBy", "employeeId employeeName fullName firstName lastName designation")
      .sort({ createdAt: -1 });

    const pObj = project.toObject();
    pObj.documents = docs;

    res.status(200).json({
      success: true,
      project: pObj,
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
    
    if (req.user && (req.user.userId || req.user.id)) {
      updateData.updatedBy = req.user.userId || req.user.id;
    }

    if (updateData.department) {
      const dept = await findOneCompanyRecord(Department, { _id: updateData.department }, req.company);
      if (!dept) return res.status(400).json({ success: false, message: "Invalid Department for this company." });
    }

    if (updateData.projectManager) {
      const pm = await findOneCompanyRecord(Employee, { _id: updateData.projectManager }, req.company);
      if (!pm) return res.status(400).json({ success: false, message: "Invalid Project Manager for this company." });
    }

    if (updateData.assignedEmployees && updateData.assignedEmployees.length > 0) {
      const emps = await findCompanyRecords(Employee, { _id: { $in: updateData.assignedEmployees } }, req.company);
      if (emps.length !== updateData.assignedEmployees.length) {
        return res.status(400).json({ success: false, message: "One or more assigned employees do not belong to this company." });
      }
    }

    const project = await findOneCompanyRecord(Project, { _id: req.params.id }, req.company);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    // Assign fields
    Object.keys(updateData).forEach((key) => {
      // Prevent company overwrite
      if (key !== 'company') {
        project[key] = updateData[key];
      }
    });

    await project.save(); // triggers pre-save validation

    const updatedProject = await findOneCompanyRecord(Project, { _id: req.params.id }, req.company, [
        { path: "department", select: "departmentName" },
        { path: "projectManager", select: "employeeId employeeName fullName firstName lastName designation" },
        { path: "assignedEmployees", select: "employeeId employeeName fullName firstName lastName designation department" }
    ]);

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
    const project = await updateCompanyRecord(Project, req.params.id, req.company, { status: "Archived" });

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
    const project = await deleteCompanyRecord(Project, req.params.id, req.company);

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }
    
    // Also cleanup docs
    await ProjectDocument.deleteMany({ project: project._id });

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
