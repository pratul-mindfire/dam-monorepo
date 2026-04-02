import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getExistingUsers, type ExistingUser } from '@/api/auth.api'
import { ASSET_TEXT, QUERY_KEYS } from '@/constants'
import useDebouncedValue from '@/hooks/useDebouncedValue'
import type { ShareAssetMutation } from '@/hooks/useAssets'

export const useShareAsset = (shareMutation: ShareAssetMutation) => {
  const [assetId, setAssetId] = useState<string | null>(null)
  const [searchInput, setSearchInput] = useState('')
  const [shareFeedback, setShareFeedback] = useState<Record<string, string>>({})
  const [shareError, setShareError] = useState<Record<string, string>>({})
  const search = useDebouncedValue(searchInput.trim(), 250)

  const usersQuery = useQuery({
    queryKey: [QUERY_KEYS.existingUsers, search],
    queryFn: () => getExistingUsers(search),
    enabled: Boolean(assetId),
  })

  const existingUsers = useMemo(() => usersQuery.data?.data ?? [], [usersQuery.data])

  const close = () => {
    setAssetId(null)
    setSearchInput('')
  }

  return {
    assetId,
    setAssetId,
    searchInput,
    setSearchInput,
    shareFeedback,
    shareError,
    usersQuery,
    existingUsers,
    open: (nextAssetId: string) => {
      setAssetId(nextAssetId)
      setSearchInput('')
      setShareError((current) => ({ ...current, [nextAssetId]: '' }))
    },
    close,
    share: async (targetAssetId: string, targetUser: ExistingUser) => {
      if (shareMutation.isPending) {
        return
      }

      try {
        const response = await shareMutation.mutateAsync({
          assetId: targetAssetId,
          userId: targetUser.id,
        })

        setShareFeedback((current) => ({
          ...current,
          [targetAssetId]: response.message || ASSET_TEXT.shareSuccess,
        }))
        setShareError((current) => ({ ...current, [targetAssetId]: '' }))
        close()
      } catch (error) {
        setShareFeedback((current) => ({ ...current, [targetAssetId]: '' }))
        setShareError((current) => ({
          ...current,
          [targetAssetId]: (error as Error)?.message || ASSET_TEXT.shareError,
        }))
      }
    },
  }
}

export default useShareAsset
