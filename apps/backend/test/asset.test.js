import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { createResponse, mockAssets, mockAssetUsers, mockIds, mockRequests } from '@tests/mock-data'

const loadAssetController = async () => {
  jest.resetModules()

  const assetService = {
    deleteAsset: jest.fn(),
    listAssets: jest.fn(),
    shareAssetWithUser: jest.fn(),
    uploadAssets: jest.fn(),
  }

  await jest.unstable_mockModule('@/services/asset.service', () => assetService)

  const controller = await import('@/controllers/asset.controller')

  return {
    assetService,
    ...controller,
  }
}

const loadAssetService = async () => {
  jest.resetModules()
  jest.unstable_unmockModule('@/services/asset.service')

  const assetRepository = {
    count: jest.fn(),
    createMany: jest.fn(),
    deleteById: jest.fn(),
    deleteManyByIds: jest.fn(),
    findById: jest.fn(),
    findByIdLean: jest.fn(),
    findByIdPopulated: jest.fn(),
    findMany: jest.fn(),
    updateById: jest.fn(),
  }

  const userRepository = {
    findById: jest.fn(),
  }

  const assetAccessService = {
    serializeAsset: jest.fn(),
    serializeAssets: jest.fn(),
  }

  const assetQueryService = {
    buildAssetListFilter: jest.fn(),
  }

  const helperService = {
    generateImageDerivatives: jest.fn(),
    generateVideoDerivatives: jest.fn(),
    isImage: jest.fn(),
    isVideo: jest.fn(),
    removeObjectIfExists: jest.fn(),
    uploadFileToStorage: jest.fn(),
  }

  const rabbitMq = {
    publishAssetMessage: jest.fn(),
  }

  const fsMock = {
    promises: {
      mkdtemp: jest.fn(),
      rm: jest.fn(),
    },
  }

  const osMock = {
    tmpdir: jest.fn(),
  }

  await jest.unstable_mockModule('@/repositories/asset.repository', () => assetRepository)
  await jest.unstable_mockModule('@/repositories/user.repository', () => userRepository)
  await jest.unstable_mockModule('@/services/asset-access.service', () => assetAccessService)
  await jest.unstable_mockModule('@/services/asset-query.service', () => assetQueryService)
  await jest.unstable_mockModule('@/utils/helpers', () => helperService)
  await jest.unstable_mockModule('@/config/rabbitmq', () => rabbitMq)
  await jest.unstable_mockModule('fs', () => ({
    default: fsMock,
  }))
  await jest.unstable_mockModule('os', () => ({
    default: osMock,
  }))

  const service = await import('@/services/asset.service')

  return {
    assetAccessService,
    assetQueryService,
    assetRepository,
    fsMock,
    helperService,
    osMock,
    rabbitMq,
    userRepository,
    ...service,
  }
}

describe('asset tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('controller flow', () => {
    it('lists assets for the authenticated user', async () => {
      const { assetService, listAssets } = await loadAssetController()
      const req = {
        query: { page: 1, limit: 10 },
        user: mockRequests.authUser,
      }
      const res = createResponse(jest)

      assetService.listAssets.mockResolvedValue({
        success: true,
        data: [],
        meta: mockAssets.listMeta,
      })

      await listAssets(req, res, jest.fn())

      expect(assetService.listAssets).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        userId: mockRequests.authUser.userId,
      })
      expect(res.json).toHaveBeenCalled()
    })

    it('uploads assets', async () => {
      const { assetService, uploadAssets } = await loadAssetController()
      const req = {
        files: [mockAssets.file],
        user: mockRequests.authUser,
      }
      const res = createResponse(jest)

      assetService.uploadAssets.mockResolvedValue([mockAssets.asset])

      await uploadAssets(req, res, jest.fn())

      expect(assetService.uploadAssets).toHaveBeenCalledWith({
        files: [mockAssets.file],
        userId: mockRequests.authUser.userId,
      })
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Assets uploaded successfully',
        data: [mockAssets.asset],
      })
    })

    it('shares an asset', async () => {
      const { assetService, shareAsset } = await loadAssetController()
      const req = {
        params: { assetId: mockIds.assetId },
        body: { userId: mockIds.otherUserId },
        user: { userId: mockIds.ownerId },
      }
      const res = createResponse(jest)

      assetService.shareAssetWithUser.mockResolvedValue({
        success: true,
        message: 'Asset shared successfully',
        data: { _id: mockIds.assetId },
      })

      await shareAsset(req, res, jest.fn())

      expect(assetService.shareAssetWithUser).toHaveBeenCalledWith({
        assetId: mockIds.assetId,
        ownerId: mockIds.ownerId,
        targetUserId: mockIds.otherUserId,
      })
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Asset shared successfully',
        data: { _id: mockIds.assetId },
      })
    })

    it('deletes an asset', async () => {
      const { assetService, deleteAsset } = await loadAssetController()
      const req = {
        params: { assetId: mockIds.assetId },
        user: mockRequests.authUser,
      }
      const res = createResponse(jest)

      assetService.deleteAsset.mockResolvedValue({
        success: true,
        message: 'Asset deleted successfully',
      })

      await deleteAsset(req, res, jest.fn())

      expect(assetService.deleteAsset).toHaveBeenCalledWith({
        assetId: mockIds.assetId,
        userId: mockRequests.authUser.userId,
      })
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Asset deleted successfully',
      })
    })

    it('forwards asset service errors to next', async () => {
      const { assetService, uploadAssets } = await loadAssetController()
      const error = new Error('upload failed')
      const next = jest.fn()

      assetService.uploadAssets.mockRejectedValue(error)

      await uploadAssets(
        {
          files: [],
          user: mockRequests.authUser,
        },
        createResponse(jest),
        next
      )

      expect(next).toHaveBeenCalledWith(error)
    })
  })

  describe('service flow', () => {
    it('returns an empty array when there are no files to upload', async () => {
      const { uploadAssets } = await loadAssetService()
      await expect(uploadAssets({ files: [], userId: mockIds.userId })).resolves.toEqual([])
    })

    it('uploads assets, creates records, publishes messages, and serializes the result', async () => {
      const { assetAccessService, assetRepository, helperService, rabbitMq, uploadAssets } =
        await loadAssetService()

      assetAccessService.serializeAssets.mockImplementation(async (assets) => assets)
      helperService.removeObjectIfExists.mockResolvedValue(undefined)
      helperService.uploadFileToStorage.mockResolvedValue({
        document: mockAssets.uploadDocument,
        message: mockAssets.uploadMessage,
      })
      rabbitMq.publishAssetMessage.mockResolvedValue(undefined)
      assetRepository.createMany.mockResolvedValue([
        {
          ...mockAssets.asset,
          _id: {
            toString: () => mockIds.assetId,
          },
        },
      ])

      const result = await uploadAssets({ files: [mockAssets.file], userId: mockIds.userId })

      expect(helperService.uploadFileToStorage).toHaveBeenCalledWith({
        file: mockAssets.file,
        userId: mockIds.userId,
        status: 'queued',
      })
      expect(assetRepository.createMany).toHaveBeenCalledWith([mockAssets.uploadDocument])
      expect(rabbitMq.publishAssetMessage).toHaveBeenCalledWith({
        assetId: mockIds.assetId,
        ...mockAssets.uploadMessage,
      })
      expect(assetAccessService.serializeAssets).toHaveBeenCalled()
      expect(result).toHaveLength(1)
    })

    it('rolls back staged uploads when upload asset creation fails', async () => {
      const { assetRepository, helperService, uploadAssets } = await loadAssetService()
      const error = new Error('create failed')

      helperService.uploadFileToStorage.mockResolvedValue({
        document: mockAssets.uploadDocument,
        message: mockAssets.uploadMessage,
      })
      helperService.removeObjectIfExists.mockResolvedValue(undefined)
      assetRepository.deleteManyByIds.mockResolvedValue(undefined)
      assetRepository.createMany.mockRejectedValue(error)

      await expect(
        uploadAssets({ files: [mockAssets.file], userId: mockIds.userId })
      ).rejects.toThrow(error)

      expect(helperService.removeObjectIfExists).toHaveBeenCalledWith(
        mockAssets.uploadDocument.filename
      )
      expect(assetRepository.deleteManyByIds).toHaveBeenCalledWith([])
    })

    it('lists assets with normalized paging metadata', async () => {
      const { assetAccessService, assetQueryService, assetRepository, listAssets } =
        await loadAssetService()

      assetQueryService.buildAssetListFilter.mockReturnValue({ userId: mockIds.userId })
      assetRepository.findMany.mockResolvedValue([mockAssets.asset])
      assetRepository.count.mockResolvedValue(1)
      assetAccessService.serializeAssets.mockImplementation(async (assets) => assets)

      const result = await listAssets({
        page: '2',
        limit: '5',
        search: 'demo',
        status: 'completed',
        type: 'image',
        userId: mockIds.userId,
      })

      expect(assetQueryService.buildAssetListFilter).toHaveBeenCalledWith({
        search: 'demo',
        status: 'completed',
        type: 'image',
        userId: mockIds.userId,
      })
      expect(assetRepository.findMany).toHaveBeenCalledWith(
        { userId: mockIds.userId },
        { page: 2, limit: 5 }
      )
      expect(result.meta).toEqual({
        page: 2,
        limit: 5,
        total: 1,
        totalPages: 1,
        search: 'demo',
        status: 'completed',
        type: 'image',
      })
    })

    it('deletes an owned asset and all derived objects', async () => {
      const { assetRepository, deleteAsset, helperService } = await loadAssetService()

      helperService.removeObjectIfExists.mockResolvedValue(undefined)
      assetRepository.findByIdLean.mockResolvedValue(mockAssets.asset)
      assetRepository.deleteById.mockResolvedValue(undefined)

      const result = await deleteAsset({ assetId: mockIds.assetId, userId: mockIds.userId })

      expect(helperService.removeObjectIfExists).toHaveBeenCalledWith(mockAssets.asset.filename)
      expect(helperService.removeObjectIfExists).toHaveBeenCalledWith('thumb-1.jpg')
      expect(helperService.removeObjectIfExists).toHaveBeenCalledWith('thumb-2.jpg')
      expect(helperService.removeObjectIfExists).toHaveBeenCalledWith('variant-1.mp4')
      expect(assetRepository.deleteById).toHaveBeenCalledWith(mockIds.assetId)
      expect(result).toEqual({
        success: true,
        message: 'Asset deleted successfully',
      })
    })

    it('rejects deleting an asset that is not owned by the user', async () => {
      const { assetRepository, deleteAsset } = await loadAssetService()

      assetRepository.findByIdLean.mockResolvedValue({
        ...mockAssets.asset,
        userId: {
          toString: () => mockIds.otherUserId,
        },
      })

      const result = deleteAsset({ assetId: mockIds.assetId, userId: mockIds.userId })

      await expect(result).rejects.toMatchObject({
        message: 'You are not allowed to delete this asset',
        statusCode: 403,
      })
    })

    it('returns already shared asset data when the target user is already present', async () => {
      const { assetAccessService, assetRepository, shareAssetWithUser, userRepository } =
        await loadAssetService()

      assetAccessService.serializeAsset.mockImplementation(async (asset) => asset)
      assetRepository.findById.mockResolvedValue({
        ...mockAssets.asset,
        userId: {
          toString: () => mockIds.ownerId,
        },
        sharedWith: [mockAssetUsers.target._id],
        save: jest.fn(),
      })
      userRepository.findById.mockResolvedValue(mockAssetUsers.target)
      assetRepository.findByIdPopulated.mockResolvedValue(mockAssets.asset)

      const result = await shareAssetWithUser({
        assetId: mockIds.assetId,
        ownerId: mockIds.ownerId,
        targetUserId: mockIds.otherUserId,
      })

      expect(assetRepository.findByIdPopulated).toHaveBeenCalledWith(mockIds.assetId)
      expect(result).toEqual({
        success: true,
        message: 'Asset already shared with this user',
        data: mockAssets.asset,
      })
    })

    it('shares an asset with a new user and saves it', async () => {
      const { assetAccessService, assetRepository, shareAssetWithUser, userRepository } =
        await loadAssetService()
      const save = jest.fn().mockResolvedValue(undefined)

      assetAccessService.serializeAsset.mockImplementation(async (asset) => asset)
      assetRepository.findById.mockResolvedValue({
        ...mockAssets.asset,
        userId: {
          toString: () => mockIds.ownerId,
        },
        sharedWith: [],
        save,
      })
      userRepository.findById.mockResolvedValue(mockAssetUsers.target)
      assetRepository.findByIdPopulated.mockResolvedValue(mockAssets.asset)

      const result = await shareAssetWithUser({
        assetId: mockIds.assetId,
        ownerId: mockIds.ownerId,
        targetUserId: mockIds.otherUserId,
      })

      expect(save).toHaveBeenCalled()
      expect(result).toEqual({
        success: true,
        message: 'Asset shared successfully',
        data: mockAssets.asset,
      })
    })

    it('processes image assets and marks them completed', async () => {
      const { assetRepository, fsMock, helperService, osMock, processAsset } =
        await loadAssetService()

      helperService.isImage.mockReturnValue(true)
      helperService.isVideo.mockReturnValue(false)
      helperService.generateImageDerivatives.mockResolvedValue({
        thumbnails: [{ objectName: 'thumb-1.jpg' }],
      })
      assetRepository.findById.mockResolvedValue(mockAssets.asset)
      assetRepository.updateById.mockResolvedValue(undefined)
      fsMock.promises.mkdtemp.mockResolvedValue('/tmp/asset-processing-123')
      fsMock.promises.rm.mockResolvedValue(undefined)
      osMock.tmpdir.mockReturnValue('/tmp')

      await processAsset({ assetId: mockIds.assetId })

      expect(fsMock.promises.mkdtemp).toHaveBeenCalledWith('/tmp/asset-processing-')
      expect(helperService.generateImageDerivatives).toHaveBeenCalledWith({
        asset: mockAssets.asset,
        objectName: mockAssets.asset.filename,
      })
      expect(assetRepository.updateById).toHaveBeenNthCalledWith(
        1,
        mockIds.assetId,
        expect.objectContaining({
          status: 'processing',
          metadata: expect.objectContaining({
            processingStartedAt: expect.any(String),
          }),
        })
      )
      expect(assetRepository.updateById).toHaveBeenNthCalledWith(
        2,
        mockIds.assetId,
        expect.objectContaining({
          status: 'completed',
          metadata: expect.objectContaining({
            thumbnails: [{ objectName: 'thumb-1.jpg' }],
            extension: '.png',
            processingCompletedAt: expect.any(String),
          }),
        })
      )
      expect(fsMock.promises.rm).toHaveBeenCalledWith('/tmp/asset-processing-123', {
        recursive: true,
        force: true,
      })
    })

    it('marks asset processing as failed when derivative generation throws', async () => {
      const { assetRepository, fsMock, helperService, osMock, processAsset } =
        await loadAssetService()
      const error = new Error('processing failed')

      helperService.isImage.mockReturnValue(false)
      helperService.isVideo.mockReturnValue(true)
      helperService.generateVideoDerivatives.mockRejectedValue(error)
      assetRepository.findById.mockResolvedValue({
        ...mockAssets.asset,
        type: 'video/mp4',
        originalName: 'demo.mp4',
        filename: 'asset-1-demo.mp4',
      })
      assetRepository.updateById.mockResolvedValue(undefined)
      fsMock.promises.mkdtemp.mockResolvedValue('/tmp/asset-processing-123')
      fsMock.promises.rm.mockResolvedValue(undefined)
      osMock.tmpdir.mockReturnValue('/tmp')

      await expect(processAsset({ assetId: mockIds.assetId })).rejects.toThrow(error)

      expect(helperService.generateVideoDerivatives).toHaveBeenCalledWith({
        asset: expect.objectContaining({
          originalName: 'demo.mp4',
          filename: 'asset-1-demo.mp4',
        }),
        objectName: 'asset-1-demo.mp4',
        tempDir: '/tmp/asset-processing-123',
      })
      expect(assetRepository.updateById).toHaveBeenNthCalledWith(
        2,
        mockIds.assetId,
        expect.objectContaining({
          status: 'failed',
          metadata: expect.objectContaining({
            processingError: 'processing failed',
            extension: '.mp4',
            processingFailedAt: expect.any(String),
          }),
        })
      )
      expect(fsMock.promises.rm).toHaveBeenCalled()
    })
  })
})
