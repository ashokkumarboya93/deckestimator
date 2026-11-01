// =============================================
// Deck Estimator — Deck Routes
// =============================================

const express = require('express');
const { authenticate } = require('../../middleware/authenticate');
const { authorize, requireApprovedContractor } = require('../../middleware/authorize');
const { validate } = require('../../middleware/validate');
const { ROLES } = require('../../shared/constants');
const deckController = require('./deck.controller');
const {
  createDeckSchema,
  updateDeckSchema,
  deckIdParamSchema,
} = require('./deck.validation');
const fileRoutes = require('../files/file.routes');

const router = express.Router();

// Role eligibility middleware for contractor verification
async function deckRoleCheck(req, res, next) {
  if (req.user && req.user.role === ROLES.CONTRACTOR) {
    return requireApprovedContractor(req, res, next);
  }
  next();
}

// All deck endpoints require authentication and authorized role
router.use(authenticate);
router.use(authorize(ROLES.CUSTOMER, ROLES.CONTRACTOR, ROLES.ADMIN));
router.use(deckRoleCheck);

// Mount nested file/image endpoints: /api/v1/decks/:deckId/images
router.use('/:deckId/images', fileRoutes);

// CRUD Endpoints for Decks
router.post('/', validate(createDeckSchema), deckController.createDeck);
router.get('/', deckController.getDecks);
router.get('/:deckId', validate(deckIdParamSchema), deckController.getDeckById);
router.patch('/:deckId', validate(updateDeckSchema), deckController.updateDeck);
router.delete('/:deckId', validate(deckIdParamSchema), deckController.deleteDeck);

module.exports = router;
