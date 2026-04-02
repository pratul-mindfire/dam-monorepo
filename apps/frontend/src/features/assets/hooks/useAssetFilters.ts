import { useMemo, useState } from 'react'
import { ASSET_FILTER_VALUES } from '@/constants'
import useDebouncedValue from '@/hooks/useDebouncedValue'

export const useAssetFilters = () => {
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [searchInput, setSearchInput] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>(ASSET_FILTER_VALUES.all)
  const [typeFilter, setTypeFilter] = useState<string>(ASSET_FILTER_VALUES.all)
  const search = useDebouncedValue(searchInput.trim(), 300)

  const queryParams = useMemo(
    () => ({
      page,
      limit,
      search: search || undefined,
      status: statusFilter === ASSET_FILTER_VALUES.all ? undefined : statusFilter,
      type: typeFilter === ASSET_FILTER_VALUES.all ? undefined : typeFilter,
    }),
    [limit, page, search, statusFilter, typeFilter]
  )

  return {
    page,
    setPage,
    limit,
    setLimit: (value: number) => {
      setLimit(value)
      setPage(1)
    },
    searchInput,
    setSearchInput: (value: string) => {
      setSearchInput(value)
      setPage(1)
    },
    search,
    statusFilter,
    setStatusFilter: (value: string) => {
      setStatusFilter(value)
      setPage(1)
    },
    typeFilter,
    setTypeFilter: (value: string) => {
      setTypeFilter(value)
      setPage(1)
    },
    hasFilters:
      Boolean(search) ||
      statusFilter !== ASSET_FILTER_VALUES.all ||
      typeFilter !== ASSET_FILTER_VALUES.all,
    clearFilters: () => {
      setSearchInput('')
      setStatusFilter(ASSET_FILTER_VALUES.all)
      setTypeFilter(ASSET_FILTER_VALUES.all)
      setPage(1)
    },
    queryParams,
  }
}

export default useAssetFilters
