import type { Asset } from '@/api/asset.api'
import {
  ASSET_TEXT,
  ASSET_STATUS_OPTIONS,
  ASSET_TYPE_OPTIONS,
  PAGE_SIZE_OPTIONS,
} from '@/constants'
import TextField from '@/components/TextField'
import {
  formatBytes,
  formatDate,
  getAssetOwner,
  getAssetOwnerId,
  getAssetPlaceholder,
  getAssetPreview,
} from '@/utils/assets'

type AssetsTableProps = {
  assets: Asset[]
  currentLimit: number
  currentPage: number
  deletePending: boolean
  error?: string
  hasFilters: boolean
  isFetching: boolean
  isLoading: boolean
  limit: number
  onClearFilters: () => void
  onDelete: (assetId: string) => void
  onLimitChange: (value: number) => void
  onNextPage: () => void
  onOpenShare: (assetId: string) => void
  onPreviousPage: () => void
  onSearchChange: (value: string) => void
  onStatusChange: (value: string) => void
  onTypeChange: (value: string) => void
  searchInput: string
  shareError: Record<string, string>
  shareFeedback: Record<string, string>
  sharePending: boolean
  statusFilter: string
  totalAssets: number
  totalPages: number
  typeFilter: string
  userId?: string
}

const AssetsTable = ({
  assets,
  currentLimit,
  currentPage,
  deletePending,
  error,
  hasFilters,
  isFetching,
  isLoading,
  limit,
  onClearFilters,
  onDelete,
  onLimitChange,
  onNextPage,
  onOpenShare,
  onPreviousPage,
  onSearchChange,
  onStatusChange,
  onTypeChange,
  searchInput,
  shareError,
  shareFeedback,
  sharePending,
  statusFilter,
  totalAssets,
  totalPages,
  typeFilter,
  userId,
}: AssetsTableProps) => {
  return (
    <section className="assets-table-section">
      <div className="assets-table-header">
        <div>
          <p className="assets-kicker">{ASSET_TEXT.libraryKicker}</p>
          <h2>{ASSET_TEXT.libraryTitle}</h2>
        </div>
        <div className="assets-table-toolbar">
          <TextField
            id="asset-search"
            type="search"
            label={ASSET_TEXT.searchLabel}
            value={searchInput}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={ASSET_TEXT.searchPlaceholder}
            wrapperClassName="asset-control asset-search-control"
          />

          <label className="asset-control">
            <span>{ASSET_TEXT.statusLabel}</span>
            <select value={statusFilter} onChange={(event) => onStatusChange(event.target.value)}>
              {ASSET_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="asset-control">
            <span>{ASSET_TEXT.typeLabel}</span>
            <select value={typeFilter} onChange={(event) => onTypeChange(event.target.value)}>
              {ASSET_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="asset-control asset-limit-control">
            <span>{ASSET_TEXT.rowsLabel}</span>
            <select value={limit} onChange={(event) => onLimitChange(Number(event.target.value))}>
              {PAGE_SIZE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option} / page
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            className="asset-clear-filters-btn"
            onClick={onClearFilters}
            disabled={!hasFilters}
          >
            {ASSET_TEXT.clearFilters}
          </button>
        </div>
      </div>

      {isLoading ? <p className="asset-feedback">{ASSET_TEXT.loadingAssets}</p> : null}
      {!isLoading && isFetching ? (
        <p className="asset-feedback">{ASSET_TEXT.refreshingAssets}</p>
      ) : null}
      {error ? <p className="asset-feedback error">{error}</p> : null}

      {!isLoading && !error ? (
        <div className="assets-table-shell">
          <table className="assets-table">
            <thead>
              <tr>
                <th>{ASSET_TEXT.previewHeader}</th>
                <th>{ASSET_TEXT.nameHeader}</th>
                <th>{ASSET_TEXT.typeHeader}</th>
                <th>{ASSET_TEXT.sizeHeader}</th>
                <th>{ASSET_TEXT.statusHeader}</th>
                <th>{ASSET_TEXT.createdHeader}</th>
                <th>{ASSET_TEXT.outputsHeader}</th>
                <th>{ASSET_TEXT.actionsHeader}</th>
              </tr>
            </thead>
            <tbody>
              {assets.length === 0 ? (
                <tr>
                  <td colSpan={8} className="assets-empty-row">
                    {ASSET_TEXT.noAssets}
                  </td>
                </tr>
              ) : (
                assets.map((asset) => {
                  const previewUrl = getAssetPreview(asset)
                  const fallbackPreview = getAssetPlaceholder(asset)
                  const thumbnailCount = asset.metadata?.thumbnails?.length ?? 0
                  const variantCount = asset.metadata?.variants?.length ?? 0
                  const owner = getAssetOwner(asset)
                  const ownerId = getAssetOwnerId(asset)
                  const isOwner = ownerId === userId

                  return (
                    <tr key={asset._id}>
                      <td data-label={ASSET_TEXT.previewHeader}>
                        <div className="asset-preview-frame">
                          <img
                            src={previewUrl || fallbackPreview}
                            alt={asset.originalName || ASSET_TEXT.previewAlt}
                            onError={(event) => {
                              event.currentTarget.onerror = null
                              event.currentTarget.src = fallbackPreview
                            }}
                          />
                        </div>
                      </td>
                      <td data-label={ASSET_TEXT.nameHeader}>
                        <div className="asset-name-cell">
                          <strong>
                            {asset.originalName || asset.name || ASSET_TEXT.unnamedAsset}
                          </strong>
                          <span>
                            {ASSET_TEXT.ownerPrefix}{' '}
                            {owner?.name || owner?.email || ownerId || ASSET_TEXT.unknownOwner}
                          </span>
                        </div>
                      </td>
                      <td data-label={ASSET_TEXT.typeHeader}>{asset.type || ASSET_TEXT.noType}</td>
                      <td data-label={ASSET_TEXT.sizeHeader}>{formatBytes(asset.size)}</td>
                      <td data-label={ASSET_TEXT.statusHeader}>
                        <span className={`asset-status asset-status-${asset.status}`}>
                          {asset.status || ASSET_TEXT.unknownStatus}
                        </span>
                      </td>
                      <td data-label={ASSET_TEXT.createdHeader}>{formatDate(asset.createdAt)}</td>
                      <td data-label={ASSET_TEXT.outputsHeader}>
                        <div className="asset-output-cell">
                          <span>
                            {thumbnailCount} {ASSET_TEXT.thumbnailsSuffix}
                          </span>
                          <span>
                            {variantCount} {ASSET_TEXT.variantsSuffix}
                          </span>
                          {asset.url ? (
                            <a href={asset.url} target="_blank" rel="noreferrer">
                              {ASSET_TEXT.openOriginal}
                            </a>
                          ) : null}
                        </div>
                      </td>
                      <td data-label={ASSET_TEXT.actionsHeader}>
                        <div className="asset-actions-cell">
                          {isOwner ? (
                            <>
                              <button
                                type="button"
                                className="asset-share-btn"
                                onClick={() => onOpenShare(asset._id)}
                                disabled={sharePending}
                              >
                                {ASSET_TEXT.share}
                              </button>
                              {shareError[asset._id] ? (
                                <p className="asset-feedback error asset-inline-feedback">
                                  {shareError[asset._id]}
                                </p>
                              ) : null}
                              {shareFeedback[asset._id] ? (
                                <p className="asset-feedback success asset-inline-feedback">
                                  {shareFeedback[asset._id]}
                                </p>
                              ) : null}
                              <button
                                type="button"
                                className="asset-delete-btn"
                                onClick={() => onDelete(asset._id)}
                                disabled={deletePending}
                              >
                                {deletePending ? ASSET_TEXT.deleting : ASSET_TEXT.delete}
                              </button>
                            </>
                          ) : (
                            <span className="asset-shared-readonly">
                              {ASSET_TEXT.shareReadonly}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      ) : null}

      {!isLoading && !error ? (
        <div className="assets-pagination">
          <p className="assets-pagination-summary">
            {totalAssets === 0
              ? ASSET_TEXT.pageEmpty
              : `${ASSET_TEXT.showingPrefix} ${(currentPage - 1) * currentLimit + 1}-${Math.min(
                  currentPage * currentLimit,
                  totalAssets
                )} ${ASSET_TEXT.ofLabel} ${totalAssets}`}
          </p>

          <div className="assets-pagination-actions">
            <button type="button" onClick={onPreviousPage} disabled={currentPage <= 1}>
              {ASSET_TEXT.previousPage}
            </button>
            <span>
              {ASSET_TEXT.paginationPageLabel} {totalPages === 0 ? 0 : currentPage}{' '}
              {ASSET_TEXT.ofLabel} {totalPages}
            </span>
            <button
              type="button"
              onClick={onNextPage}
              disabled={totalPages === 0 || currentPage >= totalPages}
            >
              {ASSET_TEXT.nextPage}
            </button>
          </div>
        </div>
      ) : null}
    </section>
  )
}

export default AssetsTable
