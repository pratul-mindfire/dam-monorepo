import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AssetsTable from '@/components/AssetsTable'
import { createAsset, renderWithProviders } from '../test-utils'

const baseProps = {
  currentLimit: 10,
  currentPage: 1,
  deletePending: false,
  hasFilters: false,
  isFetching: false,
  isLoading: false,
  limit: 10,
  onClearFilters: vi.fn(),
  onDelete: vi.fn(),
  onLimitChange: vi.fn(),
  onNextPage: vi.fn(),
  onOpenShare: vi.fn(),
  onPreviousPage: vi.fn(),
  onSearchChange: vi.fn(),
  onStatusChange: vi.fn(),
  onTypeChange: vi.fn(),
  searchInput: '',
  shareError: {},
  shareFeedback: {},
  sharePending: false,
  statusFilter: 'all',
  totalAssets: 1,
  totalPages: 1,
  typeFilter: 'all',
  userId: 'user-1',
}

describe('AssetsTable', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders assets and triggers table actions', async () => {
    const user = userEvent.setup()
    const asset = createAsset()

    renderWithProviders(
      <AssetsTable {...baseProps} assets={[asset]} currentPage={2} totalPages={3} />
    )

    expect(screen.getByRole('cell', { name: /image\/png/i })).toBeInTheDocument()
    expect(screen.getByText(/Owner:/)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Share' }))
    await user.click(screen.getByRole('button', { name: 'Delete' }))
    await user.click(screen.getByRole('button', { name: 'Next' }))
    await user.click(screen.getByRole('button', { name: 'Previous' }))

    expect(baseProps.onOpenShare).toHaveBeenCalledWith('asset-1')
    expect(baseProps.onDelete).toHaveBeenCalledWith('asset-1')
    expect(baseProps.onPreviousPage).toHaveBeenCalled()
    expect(baseProps.onNextPage).toHaveBeenCalled()
  })

  it('shows an empty state and readonly shared message for non-owners', () => {
    const sharedAsset = createAsset({
      _id: 'asset-2',
      userId: 'someone-else',
    })

    const { rerender } = renderWithProviders(
      <AssetsTable {...baseProps} assets={[]} totalAssets={0} totalPages={0} />
    )

    expect(screen.getByText('No assets found.')).toBeInTheDocument()
    expect(screen.getByText('No matching assets')).toBeInTheDocument()

    rerender(<AssetsTable {...baseProps} assets={[sharedAsset]} />)

    expect(screen.getByText('Shared with you')).toBeInTheDocument()
  })
})
