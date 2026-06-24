const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");
const projectController = require("../controllers/projectController");

// Use auth middleware for all routes
router.use(authenticate);

// Employee facing routes
const empCtrl = require("../controllers/projectEmployeeController");
router.get("/my-projects", empCtrl.getMyProjects);
router.get("/:id/details", empCtrl.getProjectDetails);
router.post("/:id/tasks", empCtrl.createTask);
router.put("/tasks/:taskId", empCtrl.updateTaskStatus);
router.post("/:id/worklogs", empCtrl.addWorkLog);
router.post("/:id/discussions", empCtrl.addDiscussion);

// Project CRUD routes (Admin/HR)
router.post("/", projectController.createProject);
router.get("/", projectController.getAllProjects);
router.get("/:id", projectController.getProjectById);
router.put("/:id", projectController.updateProject);
router.put("/:id/archive", projectController.archiveProject);
router.delete("/:id", projectController.deleteProject);

module.exports = router;
