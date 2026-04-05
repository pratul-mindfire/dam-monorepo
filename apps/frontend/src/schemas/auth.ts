import { z } from 'zod'
import { AUTH_TEXT } from '@/constants'

const emailField = z.string().trim().min(1, AUTH_TEXT.emailRequired).email(AUTH_TEXT.emailInvalid)

export const authUserSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  email: z.string().email(),
})

export const existingUserSchema = authUserSchema

export const loginRequestSchema = z.object({
  email: emailField,
  password: z.string().min(1, AUTH_TEXT.passwordRequired),
})

export const registerRequestSchema = z
  .object({
    name: z.string().trim().min(1, AUTH_TEXT.nameRequired),
    email: emailField,
    password: z.string().min(1, AUTH_TEXT.passwordRequired).min(8, AUTH_TEXT.passwordTooShort),
    confirmPassword: z.string().min(1, AUTH_TEXT.confirmPasswordRequired),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: AUTH_TEXT.passwordsMismatch,
    path: ['confirmPassword'],
  })

const authSuccessPayloadSchema = z.object({
  user: authUserSchema,
  token: z.string().min(1),
})

export const loginResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: authSuccessPayloadSchema,
})

export const registerResponseSchema = loginResponseSchema

export const meResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: authUserSchema,
})

export const logoutResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
})

export const usersResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(existingUserSchema),
})

type ValidationResult<TValues extends Record<string, string>> = {
  data?: TValues
  errors: Partial<Record<keyof TValues, string>>
}

const mapErrors = <TValues extends Record<string, string>>(issues: z.ZodIssue[]) =>
  issues.reduce<Partial<Record<keyof TValues, string>>>((accumulator, issue) => {
    const field = issue.path[0] as keyof TValues | undefined

    if (field && !accumulator[field]) {
      accumulator[field] = issue.message
    }

    return accumulator
  }, {})

export const validateLoginForm = (
  values: z.input<typeof loginRequestSchema>
): ValidationResult<z.output<typeof loginRequestSchema>> => {
  const result = loginRequestSchema.safeParse(values)

  if (!result.success) {
    return { errors: mapErrors(result.error.issues) }
  }

  return { data: result.data, errors: {} }
}

export const validateRegisterForm = (
  values: z.input<typeof registerRequestSchema>
): ValidationResult<z.output<typeof registerRequestSchema>> => {
  const result = registerRequestSchema.safeParse(values)

  if (!result.success) {
    return { errors: mapErrors(result.error.issues) }
  }

  return { data: result.data, errors: {} }
}
