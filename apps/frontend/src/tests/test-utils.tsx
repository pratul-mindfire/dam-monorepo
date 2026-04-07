import type { PropsWithChildren, ReactElement } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import type { Asset } from '@/api/asset.api'
import type { ExistingUser } from '@/api/auth.api'

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  })

export const renderWithProviders = (
  ui: ReactElement,
  {
    route = '/',
  }: {
    route?: string
  } = {}
) => {
  const queryClient = createTestQueryClient()

  const Wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
    </QueryClientProvider>
  )

  return render(ui, { wrapper: Wrapper })
}

export const createAsset = (overrides: Partial<Asset> = {}): Asset => ({
  _id: 'asset-1',
  userId: {
    _id: 'user-1',
    name: 'Alex Owner',
    email: 'alex@example.com',
  },
  sharedWith: [],
  originalName: 'hero-image.png',
  name: 'hero-image.png',
  url: 'https://cdn.example.com/hero-image.png',
  type: 'image/png',
  size: 2048,
  status: 'completed',
  metadata: {
    thumbnails: [{ url: 'https://cdn.example.com/thumb.png' }],
    variants: [{ url: 'https://cdn.example.com/variant.png', resolution: '1080p' }],
  },
  createdAt: '2026-04-01T10:00:00.000Z',
  updatedAt: '2026-04-01T10:00:00.000Z',
  ...overrides,
})

export const createExistingUser = (overrides: Partial<ExistingUser> = {}): ExistingUser => ({
  id: 'user-2',
  name: 'Taylor Share',
  email: 'taylor@example.com',
  ...overrides,
})
