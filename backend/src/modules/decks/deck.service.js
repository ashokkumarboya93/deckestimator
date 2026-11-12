// =============================================
// Deck Estimator — Deck Service
// =============================================

const Deck = require('./deck.model');
const DeckImage = require('../files/deckImage.model');
const storageProvider = require('../files/storageProvider');
const { NotFoundError, ForbiddenError } = require('../../shared/errors');
const { ROLES } = require('../../shared/constants');
const { normalizeLeanDocs } = require('../../shared/utils/queryUtils');

/**
 * Calculate rectangle/square area automatically when dimensions are provided.
 * Preserves unit accuracy (ft vs m) and rounds to 2 decimal places.
 */
function normalizeDimensions(dimensions, deckShape) {
  if (!dimensions) return undefined;

  const dim = { ...dimensions };
  if ((deckShape === 'rectangle' || deckShape === 'square') && dim.length && dim.width) {
    // Exact rectangular calculation rounded to 2 decimal places
    dim.area = Math.round(dim.length * dim.width * 100) / 100;
    dim.isManualArea = false;
  } else if (deckShape === 'l_shaped' || deckShape === 'custom' || deckShape === 'other') {
    if (dim.area !== undefined && dim.area !== null) {
      dim.area = Math.round(Number(dim.area) * 100) / 100;
      dim.isManualArea = true;
    }
  }
  return dim;
}

/**
 * Verify deck ownership, admin authorization, or assigned contractor read access.
 */
async function assertDeckAccess(deck, user, { readOnly = false } = {}) {
  if (user.role === ROLES.ADMIN) return;
  if (deck.ownerId.toString() === user.id.toString()) return;

  // If contractor and read-only access (e.g. viewing deck or images for an assigned lead)
  if (readOnly && user.role === ROLES.CONTRACTOR) {
    const Lead = require('../leads/lead.model');
    const assignedLead = await Lead.findOne({
      deckId: deck._id,
      assignedContractorId: user.id,
    }).select('_id').lean();
    if (assignedLead) return;
  }

  throw new ForbiddenError('You do not have permission to access this deck project.');
}

/**
 * Create a new deck project.
 */
async function createDeck(deckData, user) {
  const shape = deckData.deckShape || 'rectangle';
  const dimensions = normalizeDimensions(deckData.dimensions, shape);

  const deck = await Deck.create({
    ...deckData,
    deckShape: shape,
    dimensions,
    ownerId: user.id, // Strictly server-assigned
  });

  return deck.toJSON();
}

/**
 * Get paginated list of decks for the authenticated user.
 */
async function getDecks(user, { page = 1, limit = 10 } = {}) {
  let query;
  if (user.role === ROLES.ADMIN) {
    query = {};
  } else if (user.role === ROLES.CONTRACTOR) {
    const Lead = require('../leads/lead.model');
    const assignedLeads = await Lead.find({ assignedContractorId: user.id }).select('deckId').lean();
    const assignedDeckIds = assignedLeads.map((l) => l.deckId).filter(Boolean);
    query = {
      $or: [
        { ownerId: user.id },
        { _id: { $in: assignedDeckIds } },
      ],
    };
  } else {
    query = { ownerId: user.id };
  }
  const skip = (Math.max(1, page) - 1) * limit;

  const [decks, total] = await Promise.all([
    Deck.find(query)
      .populate('ownerId', 'fullName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Deck.countDocuments(query),
  ]);

  return {
    decks: normalizeLeanDocs(decks, { keepUnderscoreId: true }),
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Get single deck by ID with attached image metadata.
 */
async function getDeckById(deckId, user) {
  const deck = await Deck.findById(deckId).populate('ownerId', 'fullName email');
  if (!deck) {
    throw new NotFoundError('Deck project not found.');
  }

  await assertDeckAccess(deck, user, { readOnly: true });

  const images = await DeckImage.find({ deckId }).sort({ createdAt: 1 }).lean();

  const result = deck.toJSON();
  result.images = normalizeLeanDocs(images, { keepUnderscoreId: true });
  return result;
}

/**
 * Update deck project.
 */
async function updateDeck(deckId, updateData, user) {
  const deck = await Deck.findById(deckId);
  if (!deck) {
    throw new NotFoundError('Deck project not found.');
  }

  await assertDeckAccess(deck, user, { readOnly: false });

  // Recalculate dimensions if updated
  const shape = updateData.deckShape || deck.deckShape;
  if (updateData.dimensions) {
    updateData.dimensions = normalizeDimensions(
      { ...deck.dimensions?.toObject(), ...updateData.dimensions },
      shape
    );
  }

  // Prevent modifying ownerId or internal system fields
  delete updateData.ownerId;
  delete updateData._id;
  delete updateData.id;

  Object.assign(deck, updateData);
  await deck.save();

  return deck.toJSON();
}

/**
 * Delete deck project and cleanly remove all associated storage files & image records.
 */
async function deleteDeck(deckId, user) {
  const deck = await Deck.findById(deckId);
  if (!deck) {
    throw new NotFoundError('Deck project not found.');
  }

  await assertDeckAccess(deck, user, { readOnly: false });

  // Fetch all associated images
  const images = await DeckImage.find({ deckId });

  // Delete physical storage files
  await Promise.all(
    images.map((img) => storageProvider.deleteFile(img.storageKey))
  );

  // Delete image metadata records
  await DeckImage.deleteMany({ deckId });

  // Delete deck
  await Deck.findByIdAndDelete(deckId);

  return { message: 'Deck project and associated images deleted successfully.' };
}

module.exports = {
  createDeck,
  getDecks,
  getDeckById,
  updateDeck,
  deleteDeck,
  assertDeckAccess,
};
