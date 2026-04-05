import { ERROR_MESSAGES, HTTP_STATUS } from '@/constants'

const formatValidationErrors = (errors = []) =>
  errors.reduce((accumulator, error) => {
    if (!accumulator[error.path]) {
      accumulator[error.path] = error.msg
    }

    return accumulator
  }, {})

// eslint-disable-next-line no-unused-vars
const errorMiddleware = (err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(HTTP_STATUS.payloadTooLarge).json({
      success: false,
      message: ERROR_MESSAGES.uploadSizeExceeded,
    })
  }

  if (Array.isArray(err.errors) && err.errors.length) {
    return res.status(err.statusCode || err.status || HTTP_STATUS.badRequest).json({
      success: false,
      message: err.errors[0]?.msg || ERROR_MESSAGES.validationFailed,
      details: formatValidationErrors(err.errors),
    })
  }

  res.status(err.statusCode || err.status || HTTP_STATUS.internalServerError).json({
    success: false,
    message: err.message || ERROR_MESSAGES.internalServerError,
    ...(err.details ? { details: err.details } : {}),
  })
}

export default errorMiddleware
