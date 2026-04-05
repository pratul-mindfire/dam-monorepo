import axios from 'axios'

export const getAuthErrorMessage = (error: unknown, fallbackMessage: string) => {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message
    const validationError =
      error.response?.data?.errors?.[0]?.msg ||
      Object.values(error.response?.data?.details || {})[0]

    return message || validationError || fallbackMessage
  }

  return error instanceof Error ? error.message : fallbackMessage
}
