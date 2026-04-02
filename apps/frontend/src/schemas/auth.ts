import { z } from 'zod'
import { AUTH_TEXT } from '../constants'

const emailField = z.email(AUTH_TEXT.emailInvalid)

export const loginFormSchema = z.object({
  email: z.string().trim().min(1, AUTH_TEXT.emailRequired).pipe(emailField),
  password: z.string().min(1, AUTH_TEXT.passwordRequired),
})

export const registerFormSchema = z
  .object({
    name: z.string().trim().min(1, AUTH_TEXT.nameRequired),
    email: z.string().trim().min(1, AUTH_TEXT.emailRequired).pipe(emailField),
    password: z
      .string()
      .min(1, AUTH_TEXT.passwordRequired)
      .min(8, AUTH_TEXT.passwordTooShort),
    confirmPassword: z.string().min(1, AUTH_TEXT.confirmPasswordRequired),
  })
  .refine((data) => data.confirmPassword === data.password, {
    path: ['confirmPassword'],
    message: AUTH_TEXT.passwordsMismatch,
  })

type ValidationResult<TValues extends Record<string, string>> = {
  data?: TValues
  errors: Partial<Record<keyof TValues, string>>
}

const mapErrors = <TValues extends Record<string, string>>(
  issues: z.ZodIssue[]
) => {
  return issues.reduce<Partial<Record<keyof TValues, string>>>((accumulator, issue) => {
    const field = issue.path[0] as keyof TValues | undefined

    if (field && !accumulator[field]) {
      accumulator[field] = issue.message
    }

    return accumulator
  }, {})
}

export const validateLoginForm = (
  values: z.input<typeof loginFormSchema>
): ValidationResult<z.output<typeof loginFormSchema>> => {
  const result = loginFormSchema.safeParse(values)

  if (!result.success) {
    return { errors: mapErrors(result.error.issues) }
  }

  return { data: result.data, errors: {} }
}

export const validateRegisterForm = (
  values: z.input<typeof registerFormSchema>
): ValidationResult<z.output<typeof registerFormSchema>> => {
  const result = registerFormSchema.safeParse(values)

  if (!result.success) {
    return { errors: mapErrors(result.error.issues) }
  }

  return { data: result.data, errors: {} }
}
