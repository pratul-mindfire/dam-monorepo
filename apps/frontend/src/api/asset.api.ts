import API from '@/api/axios'
import { API_ENDPOINTS, ASSET_UPLOAD } from '@/constants'
import {
  assetSchema,
  assetUserSummarySchema,
  assetsMetaSchema,
  deleteAssetResponseSchema,
  getAssetsResponseSchema,
  shareAssetResponseSchema,
  uploadAssetsResponseSchema,
} from '@/schemas/asset'
import type { z } from 'zod'

export type AssetUserSummary = z.infer<typeof assetUserSummarySchema>
export type Asset = z.infer<typeof assetSchema>

export interface AssetQueryParams {
  page?: number
  limit?: number
  search?: string
  status?: string
  type?: string
}

export type AssetsMeta = z.infer<typeof assetsMetaSchema>
export type GetAssetsResponse = z.infer<typeof getAssetsResponseSchema>
export type UploadAssetsResponse = z.infer<typeof uploadAssetsResponseSchema>
export type DeleteAssetResponse = z.infer<typeof deleteAssetResponseSchema>
export type ShareAssetResponse = z.infer<typeof shareAssetResponseSchema>

export const getAssets = (params?: AssetQueryParams) =>
  API.get<GetAssetsResponse>(API_ENDPOINTS.assets.base, { params }).then((res) =>
    getAssetsResponseSchema.parse(res.data)
  )

export const uploadAssets = (files: File[]) => {
  const formData = new FormData()

  files.forEach((file: File) => formData.append(ASSET_UPLOAD.formFieldName, file))

  return API.post<UploadAssetsResponse>(API_ENDPOINTS.assets.upload, formData, {
    headers: { 'Content-Type': ASSET_UPLOAD.multipartContentType },
  }).then((res) => uploadAssetsResponseSchema.parse(res.data))
}

export const deleteAsset = (assetId: string) =>
  API.delete<DeleteAssetResponse>(API_ENDPOINTS.assets.byId(assetId)).then((res) =>
    deleteAssetResponseSchema.parse(res.data)
  )

export const shareAsset = (assetId: string, userId: string) =>
  API.post<ShareAssetResponse>(API_ENDPOINTS.assets.share(assetId), { userId }).then((res) =>
    shareAssetResponseSchema.parse(res.data)
  )
