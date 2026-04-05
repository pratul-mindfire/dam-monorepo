import fs from 'fs'
import os from 'os'
import path from 'path'
import { ASSET_MESSAGES, ASSET_STATUS } from '@/constants'
import { publishAssetMessage } from '@/config/rabbitmq'
import * as assetRepository from '@/repositories/asset.repository'
import * as userRepository from '@/repositories/user.repository'
import { serializeAsset, serializeAssets } from '@/services/asset-access.service'
import { buildAssetListFilter } from '@/services/asset-query.service'
import AppError from '@/utils/app-error'
import {
  generateImageDerivatives,
  generateVideoDerivatives,
  isImage,
  isVideo,
  removeObjectIfExists,
  uploadFileToStorage,
} from '@/utils/helpers'

const uploadAssets = async ({ files, userId }) => {
  if (!files?.length) {
    return []
  }

  let stagedUploads = []
  let createdAssets = []

  try {
    stagedUploads = await Promise.all(
      files.map((file) => uploadFileToStorage({ file, userId, status: ASSET_STATUS.queued }))
    )
    createdAssets = await assetRepository.createMany(stagedUploads.map(({ document }) => document))

    await Promise.all(
      createdAssets.map((asset, index) =>
        publishAssetMessage({
          assetId: asset._id.toString(),
          ...stagedUploads[index].message,
        })
      )
    )

    return serializeAssets(createdAssets)
  } catch (error) {
    await Promise.all([
      ...stagedUploads.map(({ document }) => removeObjectIfExists(document.filename)),
      assetRepository.deleteManyByIds(createdAssets.map((asset) => asset._id)),
    ])

    throw error
  }
}

const listAssets = async ({ page = 1, limit = 10, search, status, type, userId } = {}) => {
  const normalizedPage = Number(page) || 1
  const normalizedLimit = Number(limit) || 10
  const filter = buildAssetListFilter({ search, status, type, userId })

  const [assets, total] = await Promise.all([
    assetRepository.findMany(filter, { page: normalizedPage, limit: normalizedLimit }),
    assetRepository.count(filter),
  ])

  return {
    success: true,
    data: await serializeAssets(assets),
    meta: {
      page: normalizedPage,
      limit: normalizedLimit,
      total,
      totalPages: total === 0 ? 0 : Math.ceil(total / normalizedLimit),
      search: search || '',
      status: status || ASSET_STATUS.all,
      type: type || 'all',
    },
  }
}

const deleteAsset = async ({ assetId, userId }) => {
  const asset = await assetRepository.findByIdLean(assetId)

  if (!asset) {
    throw AppError.notFound(ASSET_MESSAGES.assetNotFound)
  }

  if (asset.userId?.toString() !== userId?.toString()) {
    throw AppError.forbidden(ASSET_MESSAGES.deleteForbidden)
  }

  const derivedObjects = [
    ...(asset.metadata?.thumbnails || []).map((item) => item.objectName),
    ...(asset.metadata?.variants || []).map((item) => item.objectName),
  ]

  await Promise.all([
    removeObjectIfExists(asset.filename),
    ...derivedObjects.map((objectName) => removeObjectIfExists(objectName)),
  ])

  await assetRepository.deleteById(assetId)

  return {
    success: true,
    message: ASSET_MESSAGES.deletedSuccess,
  }
}

const shareAssetWithUser = async ({ assetId, ownerId, targetUserId }) => {
  const [asset, userToShare] = await Promise.all([
    assetRepository.findById(assetId),
    userRepository.findById(targetUserId),
  ])

  if (!asset) {
    throw AppError.notFound(ASSET_MESSAGES.assetNotFound)
  }

  if (asset.userId?.toString() !== ownerId?.toString()) {
    throw AppError.forbidden(ASSET_MESSAGES.shareForbidden)
  }

  if (!userToShare) {
    throw AppError.notFound(ASSET_MESSAGES.selectedUserMissing)
  }

  if (userToShare._id.toString() === ownerId?.toString()) {
    throw AppError.badRequest(ASSET_MESSAGES.alreadyOwner)
  }

  const alreadyShared = asset.sharedWith?.some(
    (sharedUserId) => sharedUserId.toString() === userToShare._id.toString()
  )

  if (alreadyShared) {
    const populatedAsset = await assetRepository.findByIdPopulated(assetId)

    return {
      success: true,
      message: ASSET_MESSAGES.alreadyShared,
      data: await serializeAsset(populatedAsset),
    }
  }

  asset.sharedWith = [...(asset.sharedWith || []), userToShare._id]
  await asset.save()

  const populatedAsset = await assetRepository.findByIdPopulated(assetId)

  return {
    success: true,
    message: ASSET_MESSAGES.sharedSuccess,
    data: await serializeAsset(populatedAsset),
  }
}

const processAsset = async ({ assetId }) => {
  const asset = await assetRepository.findById(assetId)

  if (!asset) {
    throw AppError.notFound(`Asset ${assetId} not found`)
  }

  const baseMetadata = {
    ...(asset.metadata || {}),
    processingStartedAt: new Date().toISOString(),
  }

  await assetRepository.updateById(assetId, {
    status: ASSET_STATUS.processing,
    metadata: baseMetadata,
  })

  const tempDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'asset-processing-'))

  try {
    let derivedMetadata = {}

    if (isImage(asset.type)) {
      derivedMetadata = await generateImageDerivatives({
        asset,
        objectName: asset.filename,
      })
    } else if (isVideo(asset.type)) {
      derivedMetadata = await generateVideoDerivatives({
        asset,
        objectName: asset.filename,
        tempDir,
      })
    }

    await assetRepository.updateById(assetId, {
      status: ASSET_STATUS.completed,
      metadata: {
        ...baseMetadata,
        ...derivedMetadata,
        processingCompletedAt: new Date().toISOString(),
        extension: path.extname(asset.originalName || asset.filename || ''),
      },
    })
  } catch (error) {
    await assetRepository.updateById(assetId, {
      status: ASSET_STATUS.failed,
      metadata: {
        ...baseMetadata,
        processingFailedAt: new Date().toISOString(),
        processingError: error.message,
        extension: path.extname(asset.originalName || asset.filename || ''),
      },
    })
    throw error
  } finally {
    await fs.promises.rm(tempDir, { recursive: true, force: true })
  }
}

export { deleteAsset, listAssets, processAsset, shareAssetWithUser, uploadAssets }
