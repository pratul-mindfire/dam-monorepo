import API from '@/api/axios'
import { API_ENDPOINTS } from '@/constants'
import {
  existingUserSchema,
  authUserSchema,
  loginRequestSchema,
  loginResponseSchema,
  logoutResponseSchema,
  meResponseSchema,
  registerRequestSchema,
  registerResponseSchema,
  usersResponseSchema,
} from '@/schemas/auth'
import type { z } from 'zod'

export type AuthUser = z.infer<typeof authUserSchema>
export type ExistingUser = z.infer<typeof existingUserSchema>
export type LoginRequest = z.input<typeof loginRequestSchema>
export type RegisterRequest = z.input<typeof registerRequestSchema>
export type LoginResponse = z.infer<typeof loginResponseSchema>
export type RegisterResponse = z.infer<typeof registerResponseSchema>
export type MeResponse = z.infer<typeof meResponseSchema>
export type LogoutResponse = z.infer<typeof logoutResponseSchema>
export type UsersResponse = z.infer<typeof usersResponseSchema>

export const loginUser = (data: LoginRequest) =>
  API.post<LoginResponse>(API_ENDPOINTS.auth.login, loginRequestSchema.parse(data)).then((res) =>
    loginResponseSchema.parse(res.data)
  )

export const registerUser = (data: RegisterRequest) =>
  API.post<RegisterResponse>(API_ENDPOINTS.auth.register, registerRequestSchema.parse(data)).then(
    (res) => registerResponseSchema.parse(res.data)
  )

export const getMe = () =>
  API.get<MeResponse>(API_ENDPOINTS.auth.me).then((res) => meResponseSchema.parse(res.data))

export const getExistingUsers = (search?: string) =>
  API.get<UsersResponse>(API_ENDPOINTS.auth.users, {
    params: search?.trim() ? { search: search.trim() } : undefined,
  }).then((res) => usersResponseSchema.parse(res.data))

export const logoutUser = () =>
  API.post<LogoutResponse>(API_ENDPOINTS.auth.logout).then((res) =>
    logoutResponseSchema.parse(res.data)
  )
