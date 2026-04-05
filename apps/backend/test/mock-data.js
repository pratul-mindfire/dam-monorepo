export const mockIds = {
  userId: 'user-1',
  otherUserId: 'user-2',
  ownerId: 'owner-1',
  assetId: 'asset-1',
  mongoUserId: '507f1f77bcf86cd799439011',
  otherMongoUserId: '507f1f77bcf86cd799439012',
}

export const mockAuth = {
  user: {
    id: mockIds.userId,
    name: 'Test User',
    email: 'test@example.com',
  },
  otherUser: {
    id: mockIds.otherUserId,
    name: 'Other User',
    email: 'other@example.com',
  },
  registerBody: {
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
    confirmPassword: 'password123',
  },
  loginBody: {
    email: 'test@example.com',
    password: 'password123',
  },
  invalidLoginBody: {
    email: 'invalid-email',
    password: '123',
  },
  mismatchedRegisterBody: {
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
    confirmPassword: 'different-password',
  },
  token: 'signed-token',
}

export const mockAssets = {
  file: {
    fieldname: 'files',
    originalname: 'demo.png',
    mimetype: 'image/png',
    size: 1024,
  },
  asset: {
    _id: mockIds.assetId,
    filename: 'asset-1-demo.png',
    originalName: 'demo.png',
    userId: {
      toString: () => mockIds.userId,
    },
    type: 'image/png',
    metadata: {
      thumbnails: [{ objectName: 'thumb-1.jpg' }, { objectName: 'thumb-2.jpg' }],
      variants: [{ objectName: 'variant-1.mp4' }],
    },
  },
  uploadDocument: {
    userId: mockIds.userId,
    originalName: 'demo.png',
    filename: 'asset-1-demo.png',
    bucket: 'assets',
    type: 'image/png',
    size: 1024,
    tags: ['image'],
    metadata: {
      fieldName: 'files',
    },
    status: 'queued',
  },
  uploadMessage: {
    userId: mockIds.userId,
    bucket: 'assets',
    objectName: 'asset-1-demo.png',
    mimeType: 'image/png',
    originalName: 'demo.png',
    size: 1024,
  },
  listMeta: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    search: '',
    status: 'all',
    type: 'all',
  },
}

export const mockAssetUsers = {
  owner: {
    _id: {
      toString: () => mockIds.ownerId,
    },
    name: 'Owner User',
    email: 'owner@example.com',
  },
  target: {
    _id: {
      toString: () => mockIds.otherUserId,
    },
    name: 'Other User',
    email: 'other@example.com',
  },
}

export const mockRequests = {
  authUser: {
    userId: mockIds.userId,
  },
  mongoAuthUser: {
    userId: mockIds.mongoUserId,
  },
}

export const createResponse = (jest) => {
  const res = {}
  res.status = jest.fn(() => res)
  res.json = jest.fn(() => res)
  return res
}
