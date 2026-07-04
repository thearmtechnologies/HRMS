const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");
const documentUpload = require("../middleware/documentMulter");
const projectController = require("../controllers/projectController");

// Use auth middleware for all routes
router.use(authenticate);

// Employee facing routes
const empCtrl = require("../controllers/projectEmployeeController");
router.get("/my-projects", empCtrl.getMyProjects);
router.get("/:id/details", empCtrl.getProjectDetails);
router.post("/:id/tasks", empCtrl.createTask);
router.put("/tasks/:taskId", empCtrl.updateTaskStatus);
router.put("/:id/tasks/order", empCtrl.updateTaskOrders);
router.put("/tasks/:taskId/edit", empCtrl.editTaskDetails);
router.delete("/tasks/:taskId", empCtrl.deleteTask);
router.post("/:id/worklogs", empCtrl.addWorkLog);
router.post("/:id/discussions", empCtrl.addDiscussion);
router.post("/:id/documents", documentUpload.single("document"), empCtrl.uploadProjectDocument);

const { authorizePermission } = require("../middleware/permission");

// Project CRUD routes (Admin/HR)
router.post("/", authorizePermission('projects', 'create'), projectController.createProject);
router.get("/", authorizePermission('projects', 'view'), projectController.getAllProjects);
router.get("/:id", authorizePermission('projects', 'view'), projectController.getProjectById);
router.put("/:id", authorizePermission('projects', 'edit'), projectController.updateProject);
router.put("/:id/archive", authorizePermission('projects', 'edit'), projectController.archiveProject);
router.delete("/:id", authorizePermission('projects', 'delete'), projectController.deleteProject);

module.exports = router;
