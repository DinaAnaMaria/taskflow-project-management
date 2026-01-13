// backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Ruta pentru înregistrare: POST https://taskflow-api-qkmb.onrender.com/api/auth/register
router.post('/register', authController.register);

// Ruta pentru logare: POST https://taskflow-api-qkmb.onrender.com/api/auth/login
router.post('/login', authController.login);

module.exports = router;