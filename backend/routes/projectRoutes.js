const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const verifyToken = require('../middleware/authMiddleware'); // Importăm Paznicul

// Orice rută de aici în jos va cere Token
// POST: Creare proiect
router.post('/', verifyToken, projectController.createProject);

// GET: Afișare proiecte
router.get('/', verifyToken, projectController.getMyProjects);

module.exports = router;