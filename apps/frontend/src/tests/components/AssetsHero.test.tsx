import { screen } from '@testing-library/react'
import AssetsHero from '@/components/AssetsHero'
import { renderWithProviders } from '../test-utils'

describe('AssetsHero', () => {
  it('shows the title and summary stats', () => {
    renderWithProviders(
      <AssetsHero currentPage={2} totalAssets={12} totalPages={4} visibleAssets={5} />
    )

    expect(screen.getByRole('heading', { name: 'Assets' })).toBeInTheDocument()
    expect(screen.getByText('12')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
  })
})
