// backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Ruta pentru înregistrare: POST http://localhost:8080/api/auth/register
router.post('/register', authController.register);

// Ruta pentru logare: POST http://localhost:8080/api/auth/login
router.post('/login', authController.login);

module.exports = router;