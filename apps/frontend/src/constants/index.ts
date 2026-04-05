export const API_VERSION_HEADER = 'X-API-Version' as const

export const ROUTES = {
  authBase: '/auth',
  login: '/login',
  register: '/register',
  assets: '/assets',
  fallback: '*',
} as const

export const API_ENDPOINTS = {
  auth: {
    login: `${ROUTES.authBase}/login`,
    register: `${ROUTES.authBase}/register`,
    me: `${ROUTES.authBase}/me`,
    users: `${ROUTES.authBase}/users`,
    logout: `${ROUTES.authBase}/logout`,
  },
  assets: {
    base: '/assets',
    upload: '/assets/upload',
    byId: (assetId: string) => `/assets/${assetId}`,
    share: (assetId: string) => `/assets/${assetId}/share`,
  },
} as const

export const STORAGE_KEYS = {
  authToken: 'token',
} as const

export const QUERY_KEYS = {
  authUser: ['auth-user'] as const,
  assets: ['assets'] as const,
  existingUsers: 'existing-users',
} as const

export const ASSET_UPLOAD = {
  formFieldName: 'files',
  multipartContentType: 'multipart/form-data',
} as const

export const ASSET_DIALOG = {
  shareModalTitleId: 'share-modal-title',
} as const

export const APP_TEXT = {
  mobileMenuToggle: '\u2630',
  pageNotFoundCode: '404',
  fileCountSuffix: 'file(s)',
} as const

export const UI_TEXT = {
  sidebarTitle: 'Project Portal',
  assetsNavLabel: 'Assets',
  logout: 'Logout',
  loggingOut: 'Logging out...',
  logoutFailed: 'Logout failed:',
  notFoundTitle: 'Page Not Found',
  notFoundDescription: 'The page you are looking for does not exist.',
  notFoundAction: 'Go Home',
  boundaryTitle: '⚠️ Something went wrong',
  boundaryDescription: 'We are working to fix the issue.',
  boundaryAction: 'Reload Page',
  boundaryLog: 'Error caught by ErrorBoundary:',
} as const

export const AUTH_TEXT = {
  loginTitle: 'Welcome Back',
  loginSubtitle: 'Login to your account',
  loginSubmit: 'Login',
  loginSubmitting: 'Logging in...',
  loginFallbackError: 'Login failed',
  registerTitle: 'Create Account',
  registerSubtitle: 'Register to start uploading and sharing assets',
  registerSubmit: 'Register',
  registerSubmitting: 'Creating account...',
  registerFallbackError: 'Registration failed',
  emailLabel: 'Email',
  passwordLabel: 'Password',
  nameLabel: 'Name',
  confirmPasswordLabel: 'Confirm Password',
  emailPlaceholder: 'Enter your email',
  passwordPlaceholder: 'Enter your password',
  createPasswordPlaceholder: 'Create a password',
  confirmPasswordPlaceholder: 'Re-enter your password',
  namePlaceholder: 'Enter your full name',
  registerPrompt: "Don't have an account?",
  loginPrompt: 'Already have an account?',
  emailRequired: 'Email is required',
  emailInvalid: 'Please enter a valid email',
  passwordRequired: 'Password is required',
  passwordTooShort: 'Password must be at least 8 characters',
  nameRequired: 'Name is required',
  confirmPasswordRequired: 'Confirm password is required',
  passwordsMismatch: 'Passwords do not match',
} as const

export const ASSET_FILTER_VALUES = {
  all: 'all',
  image: 'image',
  video: 'video',
  other: 'other',
  queued: 'queued',
  processing: 'processing',
  completed: 'completed',
  failed: 'failed',
} as const

export const ASSET_TEXT = {
  heroKicker: 'Media Desk',
  heroTitle: 'Assets',
  heroSubtitle:
    'Upload files with drag and drop, then track processing, thumbnails, and transcoded outputs in one place.',
  statsMatching: 'Matching Assets',
  statsVisible: 'Visible Rows',
  statsPage: 'Page',
  uploadBadge: 'Drag and drop',
  uploadTitle: 'Drop images or videos here',
  uploadSubtitle: 'Or pick files manually and send them to the asset pipeline.',
  chooseFiles: 'Choose files',
  upload: 'Upload assets',
  uploading: 'Uploading...',
  queueTitle: 'Upload Queue',
  queueEmpty: 'No files selected yet.',
  uploadSuccess: 'Assets uploaded successfully.',
  uploadError: 'Upload failed',
  unknownFileType: 'Unknown type',
  libraryKicker: 'Library',
  libraryTitle: 'Uploaded assets',
  searchLabel: 'Search',
  searchPlaceholder: 'Name, type, or tag',
  statusLabel: 'Status',
  typeLabel: 'Type',
  rowsLabel: 'Rows',
  clearFilters: 'Clear',
  loadingAssets: 'Loading assets...',
  refreshingAssets: 'Refreshing asset list...',
  assetsLoadError: 'Failed to load assets',
  noAssets: 'No assets found.',
  previewHeader: 'Preview',
  nameHeader: 'Name',
  typeHeader: 'Type',
  sizeHeader: 'Size',
  statusHeader: 'Status',
  createdHeader: 'Created',
  outputsHeader: 'Outputs',
  actionsHeader: 'Actions',
  unknownStatus: 'unknown',
  unnamedAsset: 'Unnamed asset',
  unknownOwner: 'Unknown owner',
  noType: 'NA',
  openOriginal: 'Open original',
  share: 'Share',
  sharing: 'Sharing...',
  shareReadonly: 'Shared with you',
  delete: 'Delete',
  deleting: 'Deleting...',
  deleteConfirm: 'Delete this asset and its generated files?',
  pageEmpty: 'No matching assets',
  showingPrefix: 'Showing',
  ofLabel: 'of',
  previousPage: 'Previous',
  nextPage: 'Next',
  shareTitle: 'Select an existing user',
  shareKicker: 'Share Asset',
  shareClose: 'Close',
  shareSearchLabel: 'Find user',
  shareSearchPlaceholder: 'Search by name or email',
  shareLoading: 'Loading users...',
  shareLoadError: 'Failed to load users',
  shareEmpty: 'No existing users found.',
  shareSuccess: 'Asset shared successfully.',
  shareError: 'Share failed',
  ownerPrefix: 'Owner:',
  thumbnailsSuffix: 'thumbnails',
  variantsSuffix: 'variants',
  removeFile: 'Remove',
  previewAlt: 'Asset preview',
  paginationPageLabel: 'Page',
} as const

export const ASSET_STATUS_OPTIONS = [
  { value: ASSET_FILTER_VALUES.all, label: 'All statuses' },
  { value: ASSET_FILTER_VALUES.queued, label: 'Queued' },
  { value: ASSET_FILTER_VALUES.processing, label: 'Processing' },
  { value: ASSET_FILTER_VALUES.completed, label: 'Completed' },
  { value: ASSET_FILTER_VALUES.failed, label: 'Failed' },
] as const

export const ASSET_TYPE_OPTIONS = [
  { value: ASSET_FILTER_VALUES.all, label: 'All media' },
  { value: ASSET_FILTER_VALUES.image, label: 'Images' },
  { value: ASSET_FILTER_VALUES.video, label: 'Videos' },
  { value: ASSET_FILTER_VALUES.other, label: 'Other' },
] as const

export const PAGE_SIZE_OPTIONS = [5, 10, 20, 50] as const

export const FALLBACK_TEXT = {
  zeroBytes: '0 B',
  notAvailable: 'NA',
} as const

export const BYTE_UNITS = ['B', 'KB', 'MB', 'GB'] as const

export const ASSET_PLACEHOLDER = {
  imageLabel: 'IMAGE',
  videoLabel: 'VIDEO',
  fileLabel: 'FILE',
  imageIcon: 'IMG',
  videoIcon: 'VID',
  fileIcon: 'DOC',
  imageBgStart: '#0ea5e9',
  imageBgEnd: '#2563eb',
  videoBgStart: '#f97316',
  videoBgEnd: '#dc2626',
  fileBgStart: '#64748b',
  fileBgEnd: '#334155',
  imageBadge: '#dbeafe',
  videoBadge: '#ffedd5',
  fileBadge: '#e2e8f0',
  imageBadgeText: '#1d4ed8',
  videoBadgeText: '#c2410c',
  fileBadgeText: '#334155',
  fontFamily: 'Arial, sans-serif',
} as const
