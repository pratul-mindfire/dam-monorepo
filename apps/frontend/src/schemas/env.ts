import { z } from 'zod'

const rawAppEnvSchema = z
  .object({
    API_VERSION: z.string().trim().min(1).optional(),
    VITE_API_BASE: z.string().trim().min(1, 'VITE_API_BASE is required'),
    VITE_API_VERSION: z.string().trim().min(1).optional(),
  })
  .transform(({ API_VERSION, VITE_API_BASE, VITE_API_VERSION }) => ({
    apiBaseUrl: VITE_API_BASE,
    apiVersion: API_VERSION || VITE_API_VERSION || 'v1',
  }))

export type AppEnv = z.output<typeof rawAppEnvSchema>

export const parseAppEnv = (env: ImportMetaEnv): AppEnv => rawAppEnvSchema.parse(env)
