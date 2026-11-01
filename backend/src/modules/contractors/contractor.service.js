// =============================================
// Deck Estimator — Contractor & Verification Service (Phase 8)
// =============================================

const mongoose = require('mongoose');
const ContractorProfile = require('./contractorProfile.model');
const VerificationDocument = require('./verificationDocument.model');
const VerificationHistory = require('./verificationHistory.model');
const User = require('../users/users.model');
const AuditLog = require('../../shared/models/auditLog.model');
const storageProvider = require('../files/storageProvider');
const {
  ROLES,
  VERIFICATION_STATUS,
  VERIFICATION_DOCUMENT_STATUS,
} = require('../../shared/constants');

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
];
const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Retrieve contractor profile for the authenticated contractor user.
 */
async function getProfileByUserId(userId) {
  const profile = await ContractorProfile.findOne({ userId })
    .populate('userId', 'firstName lastName email role accountStatus')
    .populate('servicesOffered', 'name serviceCode description categoryId');

  if (!profile) {
    const error = new Error('Contractor profile not found.');
    error.statusCode = 404;
    error.code = 'PROFILE_NOT_FOUND';
    throw error;
  }
  return profile;
}

/**
 * Update permitted business fields on contractor profile.
 */
async function updateProfile(userId, updateData) {
  const profile = await ContractorProfile.findOne({ userId });
  if (!profile) {
    const error = new Error('Contractor profile not found.');
    error.statusCode = 404;
    error.code = 'PROFILE_NOT_FOUND';
    throw error;
  }

  // Whitelist of contractor-editable fields
  const allowedFields = [
    'businessName',
    'businessPhone',
    'businessEmail',
    'website',
    'businessDescription',
    'yearsOfExperience',
    'servicesOffered',
    'supportedSurfaceTypes',
    'serviceAreas',
    'businessAddress',
  ];

  const oldSnapshot = profile.toObject();

  allowedFields.forEach((field) => {
    if (updateData[field] !== undefined) {
      profile[field] = updateData[field];
    }
  });

  await profile.save();

  // Audit log
  try {
    await AuditLog.create({
      performedBy: userId,
      action: 'UPDATE_CONTRACTOR_PROFILE',
      entityType: 'CONTRACTOR',
      entityId: profile._id,
      oldValue: { businessName: oldSnapshot.businessName },
      newValue: { businessName: profile.businessName },
    });
  } catch (err) {
    console.error('AuditLog Error:', err.message);
  }

  return getProfileByUserId(userId);
}

/**
 * Submit contractor application for verification.
 */
async function submitVerification(userId, notes = '') {
  const profile = await ContractorProfile.findOne({ userId });
  if (!profile) {
    const error = new Error('Contractor profile not found.');
    error.statusCode = 404;
    error.code = 'PROFILE_NOT_FOUND';
    throw error;
  }

  const allowableStatuses = [
    VERIFICATION_STATUS.DRAFT,
    VERIFICATION_STATUS.PENDING,
    VERIFICATION_STATUS.ADDITIONAL_INFORMATION_REQUIRED,
  ];

  if (!allowableStatuses.includes(profile.verificationStatus)) {
    const error = new Error(
      `Cannot submit verification application while status is '${profile.verificationStatus}'.`
    );
    error.statusCode = 400;
    error.code = 'INVALID_STATUS_TRANSITION';
    throw error;
  }

  const previousStatus = profile.verificationStatus;
  profile.verificationStatus = VERIFICATION_STATUS.PENDING;
  profile.submittedAt = new Date();
  profile.rejectionReason = '';
  await profile.save();

  // Record verification history
  await VerificationHistory.create({
    contractorId: profile._id,
    userId,
    previousStatus,
    newStatus: VERIFICATION_STATUS.PENDING,
    action: 'SUBMIT_APPLICATION',
    reason: notes || 'Contractor submitted verification application',
    performedBy: userId,
    performedByRole: ROLES.CONTRACTOR,
  });

  // Audit log
  try {
    await AuditLog.create({
      performedBy: userId,
      action: 'SUBMIT_CONTRACTOR_VERIFICATION',
      entityType: 'CONTRACTOR',
      entityId: profile._id,
      oldValue: { status: previousStatus },
      newValue: { status: VERIFICATION_STATUS.PENDING },
    });
  } catch (err) {
    console.error('AuditLog Error:', err.message);
  }

  return getProfileByUserId(userId);
}

/**
 * Upload a verification document (license, insurance, etc.).
 */
async function uploadDocument(userId, file, documentType, notes = '') {
  if (!file || !file.buffer) {
    const error = new Error('A document file is required.');
    error.statusCode = 400;
    error.code = 'FILE_REQUIRED';
    throw error;
  }

  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    const error = new Error(
      `Unsupported file type '${file.mimetype}'. Supported types: PDF, JPEG, PNG, WebP.`
    );
    error.statusCode = 400;
    error.code = 'INVALID_FILE_TYPE';
    throw error;
  }

  if (file.buffer.length > MAX_DOCUMENT_SIZE) {
    const error = new Error('File size exceeds the 10MB limit.');
    error.statusCode = 400;
    error.code = 'FILE_TOO_LARGE';
    throw error;
  }

  const profile = await ContractorProfile.findOne({ userId });
  if (!profile) {
    const error = new Error('Contractor profile not found.');
    error.statusCode = 404;
    error.code = 'PROFILE_NOT_FOUND';
    throw error;
  }

  // Save to secure storage
  const saved = await storageProvider.saveFile(
    file.buffer,
    file.originalname,
    file.mimetype,
    'contractor-documents'
  );

  const document = await VerificationDocument.create({
    contractorId: profile._id,
    userId,
    documentType,
    originalFileName: file.originalname,
    storedFileName: saved.storageKey,
    storageKey: saved.storageKey,
    mimeType: file.mimetype,
    fileSize: saved.fileSize,
    documentStatus: VERIFICATION_DOCUMENT_STATUS.PENDING_REVIEW,
    reviewNotes: notes || '',
  });

  return document;
}

/**
 * Retrieve verification documents for a contractor.
 */
async function getDocuments(contractorId, requestingUser) {
  const profile = await ContractorProfile.findById(contractorId);
  if (!profile) {
    const error = new Error('Contractor profile not found.');
    error.statusCode = 404;
    error.code = 'PROFILE_NOT_FOUND';
    throw error;
  }

  // Isolation check: Contractor can only view their own documents; Admins can view any
  if (
    requestingUser.role !== ROLES.ADMIN &&
    profile.userId.toString() !== requestingUser.id
  ) {
    const error = new Error('Unauthorized to view these documents.');
    error.statusCode = 403;
    error.code = 'FORBIDDEN';
    throw error;
  }

  return VerificationDocument.find({ contractorId }).sort({ createdAt: -1 });
}

/**
 * Retrieve absolute file path for a verification document with strict authorization.
 */
async function getDocumentFilePath(documentId, requestingUser) {
  const doc = await VerificationDocument.findById(documentId);
  if (!doc) {
    const error = new Error('Verification document not found.');
    error.statusCode = 404;
    error.code = 'DOCUMENT_NOT_FOUND';
    throw error;
  }

  if (
    requestingUser.role !== ROLES.ADMIN &&
    doc.userId.toString() !== requestingUser.id
  ) {
    const error = new Error('Unauthorized to access this document.');
    error.statusCode = 403;
    error.code = 'FORBIDDEN';
    throw error;
  }

  const filePath = storageProvider.getFilePath(
    doc.storageKey,
    'contractor-documents'
  );
  if (!filePath) {
    const error = new Error('Document file is missing from storage.');
    error.statusCode = 404;
    error.code = 'FILE_NOT_FOUND';
    throw error;
  }

  return {
    filePath,
    mimeType: doc.mimeType,
    originalFileName: doc.originalFileName,
  };
}

/**
 * List contractors for Admin verification dashboard with search and pagination.
 */
async function listContractorsForAdmin(query = {}) {
  const {
    status,
    search,
    city,
    state,
    page = 1,
    limit = 20,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = query;

  const filter = {};

  if (status) {
    filter.verificationStatus = status.toLowerCase();
  }

  if (city) {
    filter['businessAddress.city'] = new RegExp(city, 'i');
  }

  if (state) {
    filter['businessAddress.state'] = new RegExp(state, 'i');
  }

  if (search) {
    filter.$or = [
      { businessName: new RegExp(search, 'i') },
      { licenseNumber: new RegExp(search, 'i') },
      { businessEmail: new RegExp(search, 'i') },
    ];
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (pageNum - 1) * limitNum;
  const sortDirection = sortOrder === 'asc' ? 1 : -1;

  const [items, total] = await Promise.all([
    ContractorProfile.find(filter)
      .populate('userId', 'firstName lastName email accountStatus createdAt')
      .populate('servicesOffered', 'name serviceCode')
      .sort({ [sortBy]: sortDirection })
      .skip(skip)
      .limit(limitNum),
    ContractorProfile.countDocuments(filter),
  ]);

  return {
    items,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  };
}

/**
 * Retrieve comprehensive contractor application details for Admin review.
 */
async function getContractorDetailsForAdmin(contractorProfileId) {
  const profile = await ContractorProfile.findById(contractorProfileId)
    .populate('userId', 'firstName lastName email role accountStatus createdAt')
    .populate('servicesOffered', 'name serviceCode description categoryId')
    .populate('reviewedBy', 'firstName lastName email');

  if (!profile) {
    const error = new Error('Contractor profile not found.');
    error.statusCode = 404;
    error.code = 'CONTRACTOR_NOT_FOUND';
    throw error;
  }

  const [documents, history] = await Promise.all([
    VerificationDocument.find({ contractorId: profile._id }).sort({
      createdAt: -1,
    }),
    VerificationHistory.find({ contractorId: profile._id })
      .populate('performedBy', 'firstName lastName email role')
      .sort({ createdAt: -1 }),
  ]);

  return {
    profile,
    documents,
    history,
  };
}

/**
 * Perform Admin review action (START_REVIEW, APPROVE, REJECT, REQUEST_INFORMATION, SUSPEND, REACTIVATE).
 */
async function reviewContractor(contractorProfileId, adminUser, reviewPayload) {
  const { action, reason = '', notes = '' } = reviewPayload;

  const profile = await ContractorProfile.findById(contractorProfileId);
  if (!profile) {
    const error = new Error('Contractor profile not found.');
    error.statusCode = 404;
    error.code = 'CONTRACTOR_NOT_FOUND';
    throw error;
  }

  const previousStatus = profile.verificationStatus;
  let newStatus;
  const now = new Date();

  switch (action) {
    case 'START_REVIEW':
      if (previousStatus !== VERIFICATION_STATUS.PENDING) {
        const error = new Error(
          `Cannot start review from status '${previousStatus}'. Application must be PENDING.`
        );
        error.statusCode = 400;
        error.code = 'INVALID_STATUS_TRANSITION';
        throw error;
      }
      newStatus = VERIFICATION_STATUS.UNDER_REVIEW;
      break;

    case 'APPROVE':
      if (
        ![
          VERIFICATION_STATUS.PENDING,
          VERIFICATION_STATUS.UNDER_REVIEW,
          VERIFICATION_STATUS.ADDITIONAL_INFORMATION_REQUIRED,
        ].includes(previousStatus)
      ) {
        const error = new Error(
          `Cannot approve contractor from status '${previousStatus}'.`
        );
        error.statusCode = 400;
        error.code = 'INVALID_STATUS_TRANSITION';
        throw error;
      }
      newStatus = VERIFICATION_STATUS.APPROVED;
      profile.approvedAt = now;
      profile.rejectionReason = '';
      profile.additionalInformationRequest = '';
      // Activate contractor user account upon approval
      await User.findByIdAndUpdate(profile.userId, {
        accountStatus: 'active',
      });
      break;

    case 'REJECT':
      if (
        ![
          VERIFICATION_STATUS.PENDING,
          VERIFICATION_STATUS.UNDER_REVIEW,
          VERIFICATION_STATUS.ADDITIONAL_INFORMATION_REQUIRED,
        ].includes(previousStatus)
      ) {
        const error = new Error(
          `Cannot reject contractor from status '${previousStatus}'.`
        );
        error.statusCode = 400;
        error.code = 'INVALID_STATUS_TRANSITION';
        throw error;
      }
      newStatus = VERIFICATION_STATUS.REJECTED;
      profile.rejectionReason = reason;
      break;

    case 'REQUEST_INFORMATION':
      if (
        ![
          VERIFICATION_STATUS.PENDING,
          VERIFICATION_STATUS.UNDER_REVIEW,
        ].includes(previousStatus)
      ) {
        const error = new Error(
          `Cannot request information from status '${previousStatus}'.`
        );
        error.statusCode = 400;
        error.code = 'INVALID_STATUS_TRANSITION';
        throw error;
      }
      newStatus = VERIFICATION_STATUS.ADDITIONAL_INFORMATION_REQUIRED;
      profile.additionalInformationRequest = reason;
      break;

    case 'SUSPEND':
      if (previousStatus !== VERIFICATION_STATUS.APPROVED) {
        const error = new Error(
          `Cannot suspend contractor unless status is APPROVED. Current: '${previousStatus}'.`
        );
        error.statusCode = 400;
        error.code = 'INVALID_STATUS_TRANSITION';
        throw error;
      }
      newStatus = VERIFICATION_STATUS.SUSPENDED;
      profile.suspendedAt = now;
      profile.rejectionReason = reason;
      await User.findByIdAndUpdate(profile.userId, {
        accountStatus: 'suspended',
      });
      break;

    case 'REACTIVATE':
      if (previousStatus !== VERIFICATION_STATUS.SUSPENDED) {
        const error = new Error(
          `Cannot reactivate contractor unless status is SUSPENDED. Current: '${previousStatus}'.`
        );
        error.statusCode = 400;
        error.code = 'INVALID_STATUS_TRANSITION';
        throw error;
      }
      newStatus = VERIFICATION_STATUS.APPROVED;
      profile.approvedAt = now;
      profile.rejectionReason = '';
      await User.findByIdAndUpdate(profile.userId, {
        accountStatus: 'active',
      });
      break;

    default: {
      const error = new Error(`Unsupported review action: ${action}`);
      error.statusCode = 400;
      error.code = 'INVALID_ACTION';
      throw error;
    }
  }

  profile.verificationStatus = newStatus;
  profile.reviewedBy = adminUser.id;
  profile.reviewedAt = now;
  await profile.save();

  // Create verification history entry
  await VerificationHistory.create({
    contractorId: profile._id,
    userId: profile.userId,
    previousStatus,
    newStatus,
    action,
    reason: reason || notes || `Admin performed ${action}`,
    performedBy: adminUser.id,
    performedByRole: ROLES.ADMIN,
  });

  // Audit log
  try {
    await AuditLog.create({
      performedBy: adminUser.id,
      action: `CONTRACTOR_VERIFICATION_${action}`,
      entityType: 'CONTRACTOR',
      entityId: profile._id,
      oldValue: { status: previousStatus },
      newValue: { status: newStatus, reason },
    });
  } catch (err) {
    console.error('AuditLog Error:', err.message);
  }

  return getContractorDetailsForAdmin(profile._id);
}

/**
 * Retrieve eligible contractors for lead assignment matching.
 */
async function getEligibleContractors(criteria = {}) {
  const { surfaceMaterial, serviceId, city, state } = criteria;

  // Base eligibility: verificationStatus is APPROVED
  const query = {
    verificationStatus: VERIFICATION_STATUS.APPROVED,
  };

  if (serviceId && mongoose.Types.ObjectId.isValid(serviceId)) {
    query.servicesOffered = serviceId;
  }

  if (surfaceMaterial) {
    query.supportedSurfaceTypes = new RegExp(surfaceMaterial, 'i');
  }

  const profiles = await ContractorProfile.find(query)
    .populate('userId', 'firstName lastName email accountStatus')
    .populate('servicesOffered', 'name serviceCode');

  // Filter out any contractors whose user account is suspended or disabled
  return profiles.filter(
    (p) => p.userId && p.userId.accountStatus === 'active'
  );
}

module.exports = {
  getProfileByUserId,
  updateProfile,
  submitVerification,
  uploadDocument,
  getDocuments,
  getDocumentFilePath,
  listContractorsForAdmin,
  getContractorDetailsForAdmin,
  reviewContractor,
  getEligibleContractors,
};
