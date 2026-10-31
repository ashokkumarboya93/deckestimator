// =============================================
// Deck Estimator — Authorization Middleware
// =============================================
// Verifies role and permission checks after authentication.
// Must be used AFTER authenticate middleware.

const { ROLES, VERIFICATION_STATUS } = require('../shared/constants');
const ContractorProfile = require('../modules/contractors/contractorProfile.model');

/**
 * Create a middleware that restricts access to specific roles.
 * @param  {...string} allowedRoles - Roles permitted to access the route
 *   (e.g., 'admin', 'customer', 'contractor')
 */
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_REQUIRED',
          message: 'Authentication is required.',
        },
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to perform this action.',
        },
      });
    }

    next();
  };
}

/**
 * Middleware that requires a contractor to have an 'approved' verificationStatus
 * before accessing restricted operational features.
 */
async function requireApprovedContractor(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'AUTH_REQUIRED',
        message: 'Authentication is required.',
      },
    });
  }

  if (req.user.role !== ROLES.CONTRACTOR) {
    return res.status(403).json({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: 'Contractor access required.',
      },
    });
  }

  try {
    const profile = await ContractorProfile.findOne({ userId: req.user.id });
    if (!profile) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PROFILE_NOT_FOUND',
          message: 'Contractor profile not found.',
        },
      });
    }

    if (profile.verificationStatus !== VERIFICATION_STATUS.APPROVED) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'CONTRACTOR_NOT_VERIFIED',
          message: `Access denied. Contractor status is currently '${profile.verificationStatus}'. Verification required.`,
        },
      });
    }

    req.contractorProfile = profile;
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = { authorize, requireApprovedContractor };

