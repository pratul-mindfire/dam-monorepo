import { fireEvent, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ShareAssetModal from '@/components/ShareAssetModal'
import { createExistingUser, renderWithProviders } from '../test-utils'

describe('ShareAssetModal', () => {
  it('renders users and lets the caller search, share and close', async () => {
    const user = userEvent.setup()
    const onSearchChange = vi.fn()
    const onShare = vi.fn()
    const onClose = vi.fn()
    const existingUser = createExistingUser()

    renderWithProviders(
      <ShareAssetModal
        assetId="asset-1"
        existingUsers={[existingUser]}
        isError={false}
        isLoading={false}
        isPending={false}
        onClose={onClose}
        onSearchChange={onSearchChange}
        onShare={onShare}
        searchInput=""
      />
    )

    fireEvent.change(screen.getByLabelText('Find user'), { target: { value: 'tay' } })
    await user.click(screen.getByRole('button', { name: 'Share' }))
    await user.click(screen.getByRole('button', { name: 'Close' }))

    expect(screen.getByText('Taylor Share')).toBeInTheDocument()
    expect(onSearchChange).toHaveBeenCalledWith('tay')
    expect(onShare).toHaveBeenCalledWith('asset-1', existingUser)
    expect(onClose).toHaveBeenCalled()
  })

  it('shows loading, error and empty states', () => {
    const { rerender } = renderWithProviders(
      <ShareAssetModal
        assetId="asset-1"
        existingUsers={[]}
        isError={false}
        isLoading={true}
        isPending={false}
        onClose={vi.fn()}
        onSearchChange={vi.fn()}
        onShare={vi.fn()}
        searchInput=""
      />
    )

    expect(screen.getByText('Loading users...')).toBeInTheDocument()

    rerender(
      <ShareAssetModal
        assetId="asset-1"
        error="Unable to load users"
        existingUsers={[]}
        isError={true}
        isLoading={false}
        isPending={false}
        onClose={vi.fn()}
        onSearchChange={vi.fn()}
        onShare={vi.fn()}
        searchInput=""
      />
    )

    expect(screen.getByText('Unable to load users')).toBeInTheDocument()

    rerender(
      <ShareAssetModal
        assetId="asset-1"
        existingUsers={[]}
        isError={false}
        isLoading={false}
        isPending={false}
        onClose={vi.fn()}
        onSearchChange={vi.fn()}
        onShare={vi.fn()}
        searchInput=""
      />
    )

    expect(screen.getByText('No existing users found.')).toBeInTheDocument()
  })
})
