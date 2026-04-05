import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Assets from '@/pages/Assets'
import { ASSET_TEXT } from '@/constants'
import { renderWithProviders } from '../test-utils'

const mockUseAuth = vi.fn()
const mockUseAssetFilters = vi.fn()
const mockUseFileSelection = vi.fn()
const mockUseAssets = vi.fn()
const mockUseShareAsset = vi.fn()

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}))

vi.mock('@/hooks/useAssetFilters', () => ({
  __esModule: true,
  default: () => mockUseAssetFilters(),
}))

vi.mock('@/hooks/useFileSelection', () => ({
  __esModule: true,
  default: () => mockUseFileSelection(),
}))

vi.mock('@/hooks/useAssets', () => ({
  useAssets: (...args: unknown[]) => mockUseAssets(...args),
}))

vi.mock('@/hooks/useShareAsset', () => ({
  __esModule: true,
  default: (...args: unknown[]) => mockUseShareAsset(...args),
}))

vi.mock('@/components/AssetsHero', () => ({
  default: ({ totalAssets }: { totalAssets: number }) => <div>hero:{totalAssets}</div>,
}))

vi.mock('@/components/UploadPanel', () => ({
  default: ({ onUpload, uploadPending }: { onUpload: () => void; uploadPending: boolean }) => (
    <button type="button" onClick={onUpload} disabled={uploadPending}>
      upload-panel
    </button>
  ),
}))

vi.mock('@/components/AssetsTable', () => ({
  default: ({
    error,
    onDelete,
    onOpenShare,
  }: {
    error?: string
    onDelete: (assetId: string) => void
    onOpenShare: (assetId: string) => void
  }) => (
    <div>
      <p>{error || 'table-ready'}</p>
      <button type="button" onClick={() => onDelete('asset-1')}>
        delete-from-table
      </button>
      <button type="button" onClick={() => onOpenShare('asset-1')}>
        share-from-table
      </button>
    </div>
  ),
}))

vi.mock('@/components/ShareAssetModal', () => ({
  default: ({ assetId }: { assetId: string }) => <div>share-modal:{assetId}</div>,
}))

describe('Assets page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal(
      'confirm',
      vi.fn(() => true)
    )

    mockUseAuth.mockReturnValue({
      user: { id: 'user-1' },
    })
    mockUseAssetFilters.mockReturnValue({
      clearFilters: vi.fn(),
      hasFilters: false,
      limit: 10,
      page: 2,
      queryParams: { page: 2, limit: 10 },
      searchInput: '',
      setLimit: vi.fn(),
      setPage: vi.fn(),
      setSearchInput: vi.fn(),
      setStatusFilter: vi.fn(),
      setTypeFilter: vi.fn(),
      statusFilter: 'all',
      typeFilter: 'all',
    })
    mockUseFileSelection.mockReturnValue({
      handleDrop: vi.fn(),
      handleFileSelection: vi.fn(),
      inputRef: { current: null },
      isDragging: false,
      removeSelectedFile: vi.fn(),
      selectedFiles: [],
      setIsDragging: vi.fn(),
      setSelectedFiles: vi.fn(),
    })
    mockUseAssets.mockReturnValue({
      data: {
        data: [],
        meta: {
          total: 11,
          page: 2,
          limit: 10,
          totalPages: 2,
        },
      },
      deleteMutation: {
        isPending: false,
        mutateAsync: vi.fn().mockResolvedValue(undefined),
      },
      error: null,
      isError: false,
      isFetching: false,
      isLoading: false,
      shareMutation: {
        isPending: false,
      },
      uploadMutation: {
        error: null,
        isPending: false,
        isSuccess: false,
        mutateAsync: vi.fn().mockResolvedValue(undefined),
      },
    })
    mockUseShareAsset.mockReturnValue({
      assetId: null,
      close: vi.fn(),
      existingUsers: [],
      open: vi.fn(),
      searchInput: '',
      setSearchInput: vi.fn(),
      share: vi.fn(),
      shareError: {},
      shareFeedback: {},
      usersQuery: {
        isError: false,
        isLoading: false,
      },
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('uploads files, deletes confirmed assets, and opens the share modal', async () => {
    const user = userEvent.setup()
    const uploadMutation = {
      error: null,
      isPending: false,
      isSuccess: false,
      mutateAsync: vi.fn().mockResolvedValue(undefined),
    }
    const deleteMutation = {
      isPending: false,
      mutateAsync: vi.fn().mockResolvedValue(undefined),
    }
    const open = vi.fn()
    const setSelectedFiles = vi.fn()

    mockUseFileSelection.mockReturnValue({
      handleDrop: vi.fn(),
      handleFileSelection: vi.fn(),
      inputRef: { current: null },
      isDragging: false,
      removeSelectedFile: vi.fn(),
      selectedFiles: [new File(['file'], 'poster.png', { type: 'image/png' })],
      setIsDragging: vi.fn(),
      setSelectedFiles,
    })
    mockUseAssets.mockReturnValue({
      data: {
        data: [],
        meta: {
          total: 11,
          page: 2,
          limit: 10,
          totalPages: 2,
        },
      },
      deleteMutation,
      error: null,
      isError: false,
      isFetching: false,
      isLoading: false,
      shareMutation: {
        isPending: false,
      },
      uploadMutation,
    })
    mockUseShareAsset.mockReturnValue({
      assetId: 'asset-1',
      close: vi.fn(),
      existingUsers: [],
      open,
      searchInput: '',
      setSearchInput: vi.fn(),
      share: vi.fn(),
      shareError: {},
      shareFeedback: {},
      usersQuery: {
        isError: false,
        isLoading: false,
      },
    })

    renderWithProviders(<Assets />)

    await user.click(screen.getByRole('button', { name: 'upload-panel' }))
    await waitFor(() => {
      expect(uploadMutation.mutateAsync).toHaveBeenCalled()
    })
    expect(setSelectedFiles).toHaveBeenCalledWith([])

    await user.click(screen.getByRole('button', { name: 'delete-from-table' }))
    expect(window.confirm).toHaveBeenCalledWith(ASSET_TEXT.deleteConfirm)
    expect(deleteMutation.mutateAsync).toHaveBeenCalledWith('asset-1')

    await user.click(screen.getByRole('button', { name: 'share-from-table' }))
    expect(open).toHaveBeenCalledWith('asset-1')
    expect(screen.getByText('share-modal:asset-1')).toBeInTheDocument()
  })

  it('resets pagination when the current page exceeds the available pages', async () => {
    const setPage = vi.fn()
    mockUseAssetFilters.mockReturnValue({
      ...mockUseAssetFilters(),
      page: 4,
      setPage,
    })
    mockUseAssets.mockReturnValue({
      data: {
        data: [],
        meta: {
          total: 5,
          page: 4,
          limit: 10,
          totalPages: 2,
        },
      },
      deleteMutation: {
        isPending: false,
        mutateAsync: vi.fn(),
      },
      error: null,
      isError: false,
      isFetching: false,
      isLoading: false,
      shareMutation: {
        isPending: false,
      },
      uploadMutation: {
        error: null,
        isPending: false,
        isSuccess: false,
        mutateAsync: vi.fn(),
      },
    })

    renderWithProviders(<Assets />)

    await waitFor(() => {
      expect(setPage).toHaveBeenCalledWith(2)
    })
  })
})
