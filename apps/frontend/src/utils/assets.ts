import { type Asset } from '@/api/asset.api'
import { ASSET_PLACEHOLDER, BYTE_UNITS, FALLBACK_TEXT } from '@/constants'

export const formatBytes = (bytes?: number) => {
  if (!bytes) {
    return FALLBACK_TEXT.zeroBytes
  }

  let value = bytes
  let unitIndex = 0

  while (value >= 1024 && unitIndex < BYTE_UNITS.length - 1) {
    value /= 1024
    unitIndex += 1
  }

  return `${value.toFixed(value >= 10 || unitIndex === 0 ? 0 : 1)} ${BYTE_UNITS[unitIndex]}`
}

export const formatDate = (value?: string) => {
  if (!value) {
    return FALLBACK_TEXT.notAvailable
  }

  return new Date(value).toLocaleString()
}

export const getAssetPreview = (asset: Asset) => {
  if (asset.type?.startsWith('image/')) {
    return asset.url
  }

  return asset.metadata?.thumbnails?.[0]?.url
}

export const getAssetPlaceholder = (asset: Asset) => {
  const normalizedType = (asset.type || '').toLowerCase()
  const isImage = normalizedType.startsWith('image/')
  const isVideo = normalizedType.startsWith('video/')

  const label = isImage
    ? ASSET_PLACEHOLDER.imageLabel
    : isVideo
      ? ASSET_PLACEHOLDER.videoLabel
      : ASSET_PLACEHOLDER.fileLabel
  const bgStart = isImage
    ? ASSET_PLACEHOLDER.imageBgStart
    : isVideo
      ? ASSET_PLACEHOLDER.videoBgStart
      : ASSET_PLACEHOLDER.fileBgStart
  const bgEnd = isImage
    ? ASSET_PLACEHOLDER.imageBgEnd
    : isVideo
      ? ASSET_PLACEHOLDER.videoBgEnd
      : ASSET_PLACEHOLDER.fileBgEnd
  const badge = isImage
    ? ASSET_PLACEHOLDER.imageBadge
    : isVideo
      ? ASSET_PLACEHOLDER.videoBadge
      : ASSET_PLACEHOLDER.fileBadge
  const badgeText = isImage
    ? ASSET_PLACEHOLDER.imageBadgeText
    : isVideo
      ? ASSET_PLACEHOLDER.videoBadgeText
      : ASSET_PLACEHOLDER.fileBadgeText
  const icon = isImage
    ? ASSET_PLACEHOLDER.imageIcon
    : isVideo
      ? ASSET_PLACEHOLDER.videoIcon
      : ASSET_PLACEHOLDER.fileIcon

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180" viewBox="0 0 320 180"><defs><linearGradient id="bg" x1="0" x2="1" y1="0" y2="1"><stop offset="0%" stop-color="${bgStart}"/><stop offset="100%" stop-color="${bgEnd}"/></linearGradient></defs><rect width="320" height="180" fill="url(#bg)"/><rect x="20" y="20" width="84" height="30" rx="15" fill="${badge}"/><text x="62" y="40" text-anchor="middle" font-size="14" font-family="${ASSET_PLACEHOLDER.fontFamily}" font-weight="700" fill="${badgeText}">${icon}</text><text x="160" y="102" text-anchor="middle" font-size="30" font-family="${ASSET_PLACEHOLDER.fontFamily}" font-weight="700" fill="#ffffff">${label}</text></svg>`

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}

export const getAssetOwner = (asset: Asset) => {
  if (asset.userId && typeof asset.userId === 'object') {
    return asset.userId
  }

  return undefined
}

export const getAssetOwnerId = (asset: Asset) => {
  if (asset.userId && typeof asset.userId === 'object') {
    return asset.userId._id
  }

  return asset.userId
}
