// =============================================
// Deck Estimator — Deck Controller
// =============================================

const deckService = require('./deck.service');

async function createDeck(req, res, next) {
  try {
    const deck = await deckService.createDeck(req.body, req.user);
    res.status(201).json({
      success: true,
      data: { deck },
    });
  } catch (error) {
    next(error);
  }
}

async function getDecks(req, res, next) {
  try {
    const { page, limit } = req.query;
    const result = await deckService.getDecks(req.user, { page, limit });
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

async function getDeckById(req, res, next) {
  try {
    const deck = await deckService.getDeckById(req.params.deckId, req.user);
    res.status(200).json({
      success: true,
      data: { deck },
    });
  } catch (error) {
    next(error);
  }
}

async function updateDeck(req, res, next) {
  try {
    const deck = await deckService.updateDeck(req.params.deckId, req.body, req.user);
    res.status(200).json({
      success: true,
      data: { deck },
    });
  } catch (error) {
    next(error);
  }
}

async function deleteDeck(req, res, next) {
  try {
    const result = await deckService.deleteDeck(req.params.deckId, req.user);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createDeck,
  getDecks,
  getDeckById,
  updateDeck,
  deleteDeck,
};
