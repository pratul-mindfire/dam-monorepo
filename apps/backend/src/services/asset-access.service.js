import {
  MINIO_BUCKET,
  MINIO_ENDPOINT,
  MINIO_PORT,
  MINIO_PUBLIC_BASE_URL,
  MINIO_USE_SSL,
} from '@/config/env'

const trimTrailingSlash = (value = '') => value.replace(/\/+$/, '')

const toPlainObject = (value) => {
  if (!value) {
    return value
  }

  if (typeof value.toObject === 'function') {
    return value.toObject()
  }

  return value
}

const normalizeId = (value) => {
  if (!value) {
    return value
  }

  if (typeof value === 'string') {
    return value
  }

  if (typeof value.toString === 'function') {
    return value.toString()
  }

  return value
}

const normalizeUserRef = (user) => {
  if (!user) {
    return user
  }

  if (typeof user === 'string') {
    return user
  }

  const normalizedUser = toPlainObject(user)

  if (!normalizedUser.name && !normalizedUser.email && normalizedUser._id) {
    return normalizeId(normalizedUser._id)
  }

  return {
    ...normalizedUser,
    _id: normalizeId(normalizedUser._id),
  }
}

const buildAssetAccessUrl = ({ objectName }) => {
  if (!objectName) {
    return undefined
  }

  if (MINIO_PUBLIC_BASE_URL) {
    return `${trimTrailingSlash(MINIO_PUBLIC_BASE_URL)}/${MINIO_BUCKET}/${objectName}`
  }

  const protocol = MINIO_USE_SSL === 'true' ? 'https' : 'http'

  return `${protocol}://${MINIO_ENDPOINT}:${MINIO_PORT}/${MINIO_BUCKET}/${objectName}`
}

const withAccessUrl = async (file) => ({
  ...file,
  url: buildAssetAccessUrl({
    objectName: file?.objectName,
  }),
})

export const serializeAsset = async (asset) => {
  if (!asset) {
    return asset
  }

  const normalizedAsset = toPlainObject(asset)
  const thumbnails = await Promise.all(
    (normalizedAsset.metadata?.thumbnails || []).map(withAccessUrl)
  )
  const variants = await Promise.all((normalizedAsset.metadata?.variants || []).map(withAccessUrl))

  return {
    ...normalizedAsset,
    _id: normalizeId(normalizedAsset._id),
    userId: normalizeUserRef(normalizedAsset.userId),
    sharedWith: (normalizedAsset.sharedWith || []).map(normalizeUserRef),
    url: buildAssetAccessUrl({
      objectName: normalizedAsset.filename,
    }),
    metadata: normalizedAsset.metadata
      ? {
          ...normalizedAsset.metadata,
          thumbnails,
          variants,
        }
      : normalizedAsset.metadata,
  }
}

export const serializeAssets = (assets) => Promise.all(assets.map(serializeAsset))
