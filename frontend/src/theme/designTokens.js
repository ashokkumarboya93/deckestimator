// =============================================
// Deck Estimator — Enterprise Design Tokens
// Centralized Source of Truth for Design System
// =============================================

export const colors = {
  // Brand Theme
  primary: '#0B192C',
  primaryDark: '#07101C',
  primaryLight: '#1E3E62',
  primaryAccent: '#2563EB',
  primarySubtle: '#F0F7FF',
  primaryBorder: '#BFDBFE',

  // Slate & Navy Neutrals
  navy: '#0f172a',
  navySurface: '#1e293b',
  slate: '#64748b',
  slateLight: '#94a3b8',
  slateMuted: '#cbd5e1',

  // Surfaces & Backgrounds
  background: '#f8fafc',
  surface: '#ffffff',
  surfaceAlt: '#f1f5f9',
  card: '#ffffff',

  // Borders
  border: '#e2e8f0',
  borderLight: '#f1f5f9',
  borderDark: '#cbd5e1',

  // Status & Feedback
  success: '#15803d',
  successLight: '#10b981',
  successBg: '#dcfce7',
  successBorder: '#a7f3d0',

  warning: '#b45309',
  warningLight: '#f59e0b',
  warningBg: '#fef3c7',
  warningBorder: '#fde68a',

  danger: '#b91c1c',
  dangerLight: '#ef4444',
  dangerBg: '#fee2e2',
  dangerBorder: '#fecaca',

  info: '#1d4ed8',
  infoBg: '#dbeafe',
  infoBorder: '#bfdbfe',

  // Text
  text: '#0f172a',
  textSecondary: '#475569',
  textMuted: '#64748b',
  textInverted: '#ffffff',
};

export const typography = {
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  fontSize: {
    xs: '11px',
    sm: '12px',
    base: '13px',
    md: '14px',
    lg: '16px',
    xl: '18px',
    '2xl': '22px',
    '3xl': '28px',
  },
  fontWeight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
};

export const radii = {
  none: '0px',
  xs: '4px',
  sm: '6px',
  md: '10px',
  lg: '14px',
  xl: '18px',
  '2xl': '24px',
  pill: '9999px',
};

export const shadows = {
  none: 'none',
  xs: '0 1px 2px 0 rgba(15, 23, 42, 0.04)',
  sm: '0 1px 3px 0 rgba(15, 23, 42, 0.06)',
  md: '0 4px 6px -1px rgba(15, 23, 42, 0.07), 0 2px 4px -2px rgba(15, 23, 42, 0.05)',
  lg: '0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.04)',
  xl: '0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.04)',
};

export const transitions = {
  fast: 'all 0.12s ease-in-out',
  default: 'all 0.18s ease-in-out',
  slow: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
};

// Reusable Component Token Recipes
export const componentTokens = {
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    border: `1px solid ${colors.border}`,
    boxShadow: shadows.sm,
    padding: '24px',
  },
  statCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    border: `1px solid ${colors.border}`,
    boxShadow: shadows.sm,
    padding: '16px 20px',
  },
  table: {
    th: {
      backgroundColor: '#f8fafc',
      color: colors.slate,
      fontSize: '11px',
      fontWeight: typography.fontWeight.bold,
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      padding: '12px 16px',
      borderBottom: `1px solid ${colors.border}`,
      textAlign: 'left',
    },
    td: {
      padding: '14px 16px',
      fontSize: '13px',
      color: colors.text,
      borderBottom: `1px solid ${colors.borderLight}`,
      verticalAlign: 'middle',
    },
    rowHoverBg: '#f8fafc',
  },
  button: {
    primary: {
      backgroundColor: colors.primary,
      color: colors.textInverted,
      border: 'none',
      borderRadius: radii.md,
      padding: '9px 18px',
      fontSize: '13px',
      fontWeight: typography.fontWeight.semibold,
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      transition: transitions.default,
    },
    secondary: {
      backgroundColor: colors.surface,
      color: colors.text,
      border: `1px solid ${colors.border}`,
      borderRadius: radii.md,
      padding: '8px 16px',
      fontSize: '13px',
      fontWeight: typography.fontWeight.medium,
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      transition: transitions.default,
    },
    danger: {
      backgroundColor: colors.danger,
      color: colors.textInverted,
      border: 'none',
      borderRadius: radii.md,
      padding: '8px 14px',
      fontSize: '12px',
      fontWeight: typography.fontWeight.semibold,
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      transition: transitions.default,
    },
    pill: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 16px',
      borderRadius: radii.pill,
      fontSize: '13px',
      fontWeight: typography.fontWeight.semibold,
      cursor: 'pointer',
      transition: transitions.default,
      border: `1px solid ${colors.border}`,
      backgroundColor: colors.surface,
      color: colors.text,
    },
    pillEmerald: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 16px',
      borderRadius: radii.pill,
      fontSize: '13px',
      fontWeight: typography.fontWeight.bold,
      cursor: 'pointer',
      transition: transitions.default,
      border: '1px solid #059669',
      backgroundColor: '#047857',
      color: '#ffffff',
      boxShadow: '0 2px 4px rgba(4, 120, 87, 0.2)',
    },
  },
  input: {
    height: '40px',
    padding: '0 14px',
    borderRadius: radii.md,
    border: `1px solid ${colors.border}`,
    backgroundColor: colors.surface,
    fontSize: '13px',
    color: colors.text,
    outline: 'none',
    transition: transitions.fast,
  },
  selectPill: {
    height: '38px',
    padding: '0 32px 0 14px',
    borderRadius: radii.pill,
    border: `1px solid ${colors.border}`,
    backgroundColor: colors.surface,
    fontSize: '13px',
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    outline: 'none',
    cursor: 'pointer',
    appearance: 'none',
  },
  badge: {
    created: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '3px 10px',
      borderRadius: radii.pill,
      fontSize: '11px',
      fontWeight: typography.fontWeight.bold,
      backgroundColor: '#f1f5f9',
      color: '#475569',
      border: '1px solid #cbd5e1',
    },
    requested: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '3px 10px',
      borderRadius: radii.pill,
      fontSize: '11px',
      fontWeight: typography.fontWeight.bold,
      backgroundColor: colors.warningBg,
      color: colors.warning,
      border: `1px solid ${colors.warningBorder}`,
    },
    inProgress: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '3px 10px',
      borderRadius: radii.pill,
      fontSize: '11px',
      fontWeight: typography.fontWeight.bold,
      backgroundColor: '#ede9fe',
      color: '#6d28d9',
      border: '1px solid #ddd6fe',
    },
    completed: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '3px 10px',
      borderRadius: radii.pill,
      fontSize: '11px',
      fontWeight: typography.fontWeight.bold,
      backgroundColor: colors.successBg,
      color: colors.success,
      border: `1px solid ${colors.successBorder}`,
    },
  },
};

const designTokens = {
  colors,
  typography,
  radii,
  shadows,
  transitions,
  components: componentTokens,
};

export default designTokens;

