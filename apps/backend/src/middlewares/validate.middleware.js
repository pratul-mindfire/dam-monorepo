import { validationResult } from 'express-validator'
import { ERROR_MESSAGES } from '@/constants'
import AppError from '@/utils/app-error'

const formatValidationDetails = (validationErrors) =>
  validationErrors.reduce((accumulator, error) => {
    if (!accumulator[error.path]) {
      accumulator[error.path] = error.msg
    }

    return accumulator
  }, {})

const validate = (req, res, next) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    const validationErrors = errors.array()

    return next(
      AppError.badRequest(validationErrors[0]?.msg || ERROR_MESSAGES.validationFailed, {
        details: formatValidationDetails(validationErrors),
      })
    )
  }

  next()
}

export { validate }
