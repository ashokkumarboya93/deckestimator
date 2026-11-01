// =============================================
// Deck Estimator — Auth Routes
// =============================================

const express = require('express');
const authController = require('./auth.controller');
const { registerSchema, loginSchema } = require('./auth.validation');
const { validate } = require('../../middleware/validate');
const { authenticate } = require('../../middleware/authenticate');
const { authLimiter } = require('../../middleware/rateLimiters');

const router = express.Router();

router.post('/register', authLimiter, validate(registerSchema), authController.register);
router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/logout', authController.logout);
router.get('/me', authenticate, authController.getMe);

module.exports = router;
