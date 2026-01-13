const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const verifyToken = require('../middleware/authMiddleware');

// Toate rutele sunt protejate (trebuie să fii logat)
// POST: Creare Task
router.post('/', verifyToken, taskController.createTask);

// GET: Vezi task-urile unui anumit proiect (ex: /api/tasks/project/5)
router.get('/project/:projectId', verifyToken, taskController.getProjectTasks);

module.exports = router;