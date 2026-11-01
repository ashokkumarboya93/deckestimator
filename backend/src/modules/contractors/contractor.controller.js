// =============================================
// Deck Estimator — Contractor Controller (Phase 8)
// =============================================

const contractorService = require('./contractor.service');

async function getProfile(req, res, next) {
  try {
    const profile = await contractorService.getProfileByUserId(req.user.id);
    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
}

async function updateProfile(req, res, next) {
  try {
    const updated = await contractorService.updateProfile(req.user.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Contractor profile updated successfully.',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}

async function submitVerification(req, res, next) {
  try {
    const profile = await contractorService.submitVerification(
      req.user.id,
      req.body?.notes
    );
    res.status(200).json({
      success: true,
      message: 'Verification application submitted successfully.',
      data: profile,
    });
  } catch (error) {
    next(error);
  }
}

async function uploadDocument(req, res, next) {
  try {
    const doc = await contractorService.uploadDocument(
      req.user.id,
      req.file,
      req.body.documentType,
      req.body.notes
    );
    res.status(201).json({
      success: true,
      message: 'Verification document uploaded successfully.',
      data: doc,
    });
  } catch (error) {
    next(error);
  }
}

async function getMyDocuments(req, res, next) {
  try {
    const profile = await contractorService.getProfileByUserId(req.user.id);
    const docs = await contractorService.getDocuments(profile._id, req.user);
    res.status(200).json({
      success: true,
      data: docs,
    });
  } catch (error) {
    next(error);
  }
}

async function downloadDocument(req, res, next) {
  try {
    const fileInfo = await contractorService.getDocumentFilePath(
      req.params.documentId,
      req.user
    );
    res.setHeader('Content-Type', fileInfo.mimeType);
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${fileInfo.originalFileName}"`
    );
    res.sendFile(fileInfo.filePath);
  } catch (error) {
    next(error);
  }
}

async function adminListContractors(req, res, next) {
  try {
    const result = await contractorService.listContractorsForAdmin(req.query);
    res.status(200).json({
      success: true,
      data: result.items,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
}

async function adminGetContractorDetails(req, res, next) {
  try {
    const details = await contractorService.getContractorDetailsForAdmin(
      req.params.id
    );
    res.status(200).json({
      success: true,
      data: details,
    });
  } catch (error) {
    next(error);
  }
}

async function adminReviewContractor(req, res, next) {
  try {
    const result = await contractorService.reviewContractor(
      req.params.id,
      req.user,
      req.body
    );
    res.status(200).json({
      success: true,
      message: `Contractor application ${req.body.action.toLowerCase()}ed successfully.`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

async function getEligibleContractors(req, res, next) {
  try {
    const eligible = await contractorService.getEligibleContractors(req.query);
    res.status(200).json({
      success: true,
      data: eligible,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getProfile,
  updateProfile,
  submitVerification,
  uploadDocument,
  getMyDocuments,
  downloadDocument,
  adminListContractors,
  adminGetContractorDetails,
  adminReviewContractor,
  getEligibleContractors,
};
