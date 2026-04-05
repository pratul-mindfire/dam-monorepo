import { z } from 'zod'

export const assetUserSummarySchema = z.object({
  _id: z.string().min(1),
  name: z.string().min(1),
  email: z.string().email(),
})

const assetFileVariantSchema = z.object({
  url: z.string().optional(),
  objectName: z.string().optional(),
  size: z.number().optional(),
  contentType: z.string().optional(),
})

const assetMetadataSchema = z
  .object({
    thumbnails: z.array(assetFileVariantSchema).optional(),
    variants: z
      .array(
        assetFileVariantSchema.extend({
          resolution: z.string().optional(),
        })
      )
      .optional(),
  })
  .optional()

export const assetSchema = z.object({
  _id: z.string().min(1),
  userId: z.union([z.string(), assetUserSummarySchema]).optional(),
  sharedWith: z.array(assetUserSummarySchema).optional(),
  originalName: z.string().optional(),
  name: z.string().optional(),
  url: z.string().optional(),
  type: z.string().optional(),
  size: z.number().optional(),
  status: z.string().optional(),
  metadata: assetMetadataSchema,
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
})

export const assetsMetaSchema = z.object({
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  totalPages: z.number(),
  search: z.string(),
  status: z.string(),
  type: z.string(),
})

export const getAssetsResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(assetSchema),
  meta: assetsMetaSchema,
})

export const uploadAssetsResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(assetSchema),
})

export const deleteAssetResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
})

export const shareAssetResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: assetSchema,
})
