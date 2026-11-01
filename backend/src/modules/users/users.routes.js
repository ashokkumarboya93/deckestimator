// =============================================
// Deck Estimator — Users Routes
// =============================================

const express = require('express');
const usersController = require('./users.controller');
const { updateProfileSchema } = require('./users.validation');
const { validate } = require('../../middleware/validate');
const { authenticate } = require('../../middleware/authenticate');

const router = express.Router();

router.use(authenticate); // All user profile routes require authentication

router.get('/me', usersController.getProfile);
router.patch('/me', validate(updateProfileSchema), usersController.updateProfile);

module.exports = router;
