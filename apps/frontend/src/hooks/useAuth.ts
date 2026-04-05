import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { QUERY_KEYS, STORAGE_KEYS } from '@/constants'
import {
  getMe,
  loginUser,
  logoutUser,
  registerUser,
  type AuthUser,
  type LoginRequest,
  type MeResponse,
  type RegisterRequest,
  type RegisterResponse,
} from '@/api/auth.api'

export const useAuth = () => {
  const queryClient = useQueryClient()

  const userQuery = useQuery({
    queryKey: QUERY_KEYS.authUser,
    queryFn: getMe,
    enabled: !!localStorage.getItem(STORAGE_KEYS.authToken),
    retry: false,
  })

  const loginMutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      localStorage.setItem(STORAGE_KEYS.authToken, data.data.token)
      queryClient.setQueryData<MeResponse>(QUERY_KEYS.authUser, {
        success: true,
        message: data.message,
        data: data.data.user,
      })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.authUser })
    },
  })

  const registerMutation = useMutation({
    mutationFn: registerUser,
    onSuccess: (data) => {
      localStorage.setItem(STORAGE_KEYS.authToken, data.data.token)
      queryClient.setQueryData<MeResponse>(QUERY_KEYS.authUser, {
        success: true,
        message: data.message,
        data: data.data.user,
      })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.authUser })
    },
  })

  const logoutMutation = useMutation({
    mutationFn: logoutUser,
    onSettled: async () => {
      localStorage.removeItem(STORAGE_KEYS.authToken)
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.authUser })
      queryClient.removeQueries({ queryKey: QUERY_KEYS.authUser })
    },
  })

  return {
    user: userQuery.data?.data as AuthUser | undefined,
    isLoading: userQuery.isLoading,
    isAuthenticated: !!localStorage.getItem(STORAGE_KEYS.authToken),
    login: (data: LoginRequest) => loginMutation.mutateAsync(data),
    loginLoading: loginMutation.isPending,
    loginError: loginMutation.error,
    register: (data: RegisterRequest) =>
      registerMutation.mutateAsync(data) as Promise<RegisterResponse>,
    registerLoading: registerMutation.isPending,
    registerError: registerMutation.error,
    logout: () => logoutMutation.mutateAsync(),
    logoutLoading: logoutMutation.isPending,
  }
}
