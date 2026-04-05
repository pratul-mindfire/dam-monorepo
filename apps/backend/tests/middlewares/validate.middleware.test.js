import { describe, expect, it, jest } from '@jest/globals'
import { validate } from '@/middlewares/validate.middleware'
import { mockAuth } from '@tests/mock-data'
import {
  assetListValidator,
  assetShareValidator,
  assetUploadValidator,
} from '@/validators/asset.validator'
import { createUserValidator, loginUserValidator } from '@/validators/user.validator'

const runValidators = async (validators, req) => {
  for (const validator of validators) {
    await validator.run(req)
  }
}

describe('validate middleware', () => {
  it('formats register validation errors', async () => {
    const req = {
      body: mockAuth.mismatchedRegisterBody,
    }
    const next = jest.fn()

    await runValidators(createUserValidator, req)
    validate(req, {}, next)

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 400,
        message: 'Passwords do not match',
        details: {
          confirmPassword: 'Passwords do not match',
        },
      })
    )
  })

  it('formats login validation errors', async () => {
    const req = {
      body: mockAuth.invalidLoginBody,
    }
    const next = jest.fn()

    await runValidators(loginUserValidator, req)
    validate(req, {}, next)

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 400,
        message: 'Invalid email format',
        details: {
          email: 'Invalid email format',
          password: 'Password must be at least 8 characters',
        },
      })
    )
  })

  it('formats invalid asset list query errors', async () => {
    const req = {
      query: {
        limit: '999',
      },
    }
    const next = jest.fn()

    await runValidators(assetListValidator, req)
    validate(req, {}, next)

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 400,
        message: 'limit must be an integer between 1 and 100',
        details: {
          limit: 'limit must be an integer between 1 and 100',
        },
      })
    )
  })

  it('formats upload validation errors', async () => {
    const req = {
      body: {},
      files: [],
    }
    const next = jest.fn()

    await runValidators(assetUploadValidator, req)
    validate(req, {}, next)

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 400,
        message: 'At least one file is required',
        details: {
          _assetUpload: 'At least one file is required',
        },
      })
    )
  })

  it('formats asset share validation errors', async () => {
    const req = {
      body: {
        userId: 'bad-id',
      },
    }
    const next = jest.fn()

    await runValidators(assetShareValidator, req)
    validate(req, {}, next)

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 400,
        message: 'userId must be a valid user id',
        details: {
          userId: 'userId must be a valid user id',
        },
      })
    )
  })

  it('calls next with no error when validation passes', async () => {
    const req = {
      body: mockAuth.loginBody,
    }
    const next = jest.fn()

    await runValidators(loginUserValidator, req)
    validate(req, {}, next)

    expect(next).toHaveBeenCalledWith()
  })
})
