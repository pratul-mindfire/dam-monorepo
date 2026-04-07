import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { createResponse, mockAuth, mockIds, mockRequests } from '@tests/mock-data'

const loadAuthController = async () => {
  jest.resetModules()

  const authService = {
    getCurrentUser: jest.fn(),
    listExistingUsers: jest.fn(),
    loginUser: jest.fn(),
    registerUser: jest.fn(),
  }

  await jest.unstable_mockModule('@/services/auth.service', () => authService)

  const controller = await import('@/controllers/auth.controller')

  return {
    authService,
    ...controller,
  }
}

const loadAuthService = async () => {
  jest.resetModules()
  jest.unstable_unmockModule('@/services/auth.service')

  const userRepository = {
    createUser: jest.fn(),
    findByEmail: jest.fn(),
    findById: jest.fn(),
    listExistingUsers: jest.fn(),
  }

  const jwt = {
    sign: jest.fn(),
  }

  await jest.unstable_mockModule('@/repositories/user.repository', () => userRepository)
  await jest.unstable_mockModule('jsonwebtoken', () => ({
    default: jwt,
  }))

  const service = await import('@/services/auth.service')

  return {
    jwt,
    userRepository,
    ...service,
  }
}

describe('user tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('controller flow', () => {
    it('registers a user and returns a created response', async () => {
      const { authService, register } = await loadAuthController()
      const req = {
        body: {
          name: mockAuth.registerBody.name,
          email: mockAuth.registerBody.email,
          password: mockAuth.registerBody.password,
        },
      }
      const res = createResponse(jest)
      const next = jest.fn()

      authService.registerUser.mockResolvedValue({
        user: mockAuth.user,
        token: mockAuth.token,
      })

      await register(req, res, next)

      expect(authService.registerUser).toHaveBeenCalledWith(
        mockAuth.registerBody.name,
        mockAuth.registerBody.email,
        mockAuth.registerBody.password
      )
      expect(res.status).toHaveBeenCalledWith(201)
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'User registered successfully',
        data: {
          user: mockAuth.user,
          token: mockAuth.token,
        },
      })
      expect(next).not.toHaveBeenCalled()
    })

    it('logs in a user', async () => {
      const { authService, login } = await loadAuthController()
      const req = { body: mockAuth.loginBody }
      const res = createResponse(jest)

      authService.loginUser.mockResolvedValue({
        user: mockAuth.user,
        token: mockAuth.token,
      })

      await login(req, res, jest.fn())

      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Login successful',
        data: {
          user: mockAuth.user,
          token: mockAuth.token,
        },
      })
    })

    it('logs out a user', async () => {
      const { logout } = await loadAuthController()
      const res = createResponse(jest)

      logout({}, res)

      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Logout successful.',
      })
    })

    it('returns the current profile', async () => {
      const { authService, getProfile } = await loadAuthController()
      const req = { user: mockRequests.authUser }
      const res = createResponse(jest)

      authService.getCurrentUser.mockResolvedValue(mockAuth.user)

      await getProfile(req, res, jest.fn())

      expect(authService.getCurrentUser).toHaveBeenCalledWith(mockRequests.authUser.userId)
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockAuth.user,
      })
    })

    it('lists existing users', async () => {
      const { authService, listUsers } = await loadAuthController()
      const req = {
        user: mockRequests.authUser,
        query: { search: 'other' },
      }
      const res = createResponse(jest)

      authService.listExistingUsers.mockResolvedValue([mockAuth.otherUser])

      await listUsers(req, res, jest.fn())

      expect(authService.listExistingUsers).toHaveBeenCalledWith({
        currentUserId: mockRequests.authUser.userId,
        search: 'other',
      })
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: [mockAuth.otherUser],
      })
    })

    it('forwards service errors to next', async () => {
      const { authService, login } = await loadAuthController()
      const error = new Error('boom')
      const next = jest.fn()

      authService.loginUser.mockRejectedValue(error)

      await login({ body: mockAuth.loginBody }, createResponse(jest), next)

      expect(next).toHaveBeenCalledWith(error)
    })
  })

  describe('service flow', () => {
    it('registers a user when the email is available', async () => {
      const { jwt, registerUser, userRepository } = await loadAuthService()
      jwt.sign.mockReturnValue(mockAuth.token)
      userRepository.findByEmail.mockResolvedValue(null)
      userRepository.createUser.mockResolvedValue({
        _id: mockIds.userId,
        name: mockAuth.user.name,
        email: mockAuth.user.email,
      })

      const result = await registerUser(
        mockAuth.registerBody.name,
        mockAuth.registerBody.email,
        mockAuth.registerBody.password
      )

      expect(userRepository.findByEmail).toHaveBeenCalledWith(mockAuth.registerBody.email)
      expect(userRepository.createUser).toHaveBeenCalledWith({
        name: mockAuth.registerBody.name,
        email: mockAuth.registerBody.email,
        password: mockAuth.registerBody.password,
      })
      expect(jwt.sign).toHaveBeenCalled()
      expect(result).toEqual({
        user: mockAuth.user,
        token: mockAuth.token,
      })
    })

    it('rejects registration when the email already exists', async () => {
      const { registerUser, userRepository } = await loadAuthService()
      userRepository.findByEmail.mockResolvedValue({ _id: 'existing-user' })

      const result = registerUser(
        mockAuth.registerBody.name,
        mockAuth.registerBody.email,
        mockAuth.registerBody.password
      )

      await expect(result).rejects.toMatchObject({
        message: 'Email already registered',
        statusCode: 409,
      })
    })

    it('logs in a user with valid credentials', async () => {
      const { jwt, loginUser, userRepository } = await loadAuthService()
      jwt.sign.mockReturnValue(mockAuth.token)
      userRepository.findByEmail.mockResolvedValue({
        _id: mockIds.userId,
        name: mockAuth.user.name,
        email: mockAuth.user.email,
        matchPassword: jest.fn().mockResolvedValue(true),
      })

      const result = await loginUser(mockAuth.loginBody.email, mockAuth.loginBody.password)

      expect(userRepository.findByEmail).toHaveBeenCalledWith(mockAuth.loginBody.email, {
        includePassword: true,
      })
      expect(result.token).toBe(mockAuth.token)
      expect(result.user.email).toBe(mockAuth.user.email)
    })

    it('rejects login when the password is invalid', async () => {
      const { loginUser, userRepository } = await loadAuthService()
      userRepository.findByEmail.mockResolvedValue({
        matchPassword: jest.fn().mockResolvedValue(false),
      })

      await expect(loginUser(mockAuth.loginBody.email, 'wrong-password')).rejects.toMatchObject({
        message: 'Invalid email or password',
        statusCode: 401,
      })
    })

    it('returns the current user profile', async () => {
      const { getCurrentUser, userRepository } = await loadAuthService()
      userRepository.findById.mockResolvedValue({
        _id: mockIds.userId,
        name: mockAuth.user.name,
        email: mockAuth.user.email,
      })

      await expect(getCurrentUser(mockIds.userId)).resolves.toEqual(mockAuth.user)
    })

    it('lists existing users excluding the current user', async () => {
      const { listExistingUsers, userRepository } = await loadAuthService()
      userRepository.listExistingUsers.mockResolvedValue([
        {
          _id: mockIds.otherUserId,
          name: mockAuth.otherUser.name,
          email: mockAuth.otherUser.email,
        },
      ])

      await expect(
        listExistingUsers({ currentUserId: mockIds.userId, search: 'other' })
      ).resolves.toEqual([mockAuth.otherUser])

      expect(userRepository.listExistingUsers).toHaveBeenCalledWith({
        _id: { $ne: mockIds.userId },
        $or: [
          { name: { $regex: 'other', $options: 'i' } },
          { email: { $regex: 'other', $options: 'i' } },
        ],
      })
    })

    it('delegates token signing to jsonwebtoken', async () => {
      const { generateToken, jwt } = await loadAuthService()
      jwt.sign.mockReturnValue(mockAuth.token)

      expect(generateToken(mockIds.userId)).toBe(mockAuth.token)
      expect(jwt.sign).toHaveBeenCalledWith({ userId: mockIds.userId }, expect.any(String), {
        expiresIn: expect.any(String),
      })
    })
  })
})
