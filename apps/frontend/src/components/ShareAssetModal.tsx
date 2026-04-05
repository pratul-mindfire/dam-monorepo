import type { ExistingUser } from '@/api/auth.api'
import { ASSET_DIALOG, ASSET_TEXT } from '@/constants'
import Modal from '@/components/Modal'
import TextField from '@/components/TextField'

type ShareAssetModalProps = {
  assetId: string
  error?: string
  existingUsers: ExistingUser[]
  isError: boolean
  isLoading: boolean
  isPending: boolean
  onClose: () => void
  onSearchChange: (value: string) => void
  onShare: (assetId: string, targetUser: ExistingUser) => void
  searchInput: string
}

const ShareAssetModal = ({
  assetId,
  error,
  existingUsers,
  isError,
  isLoading,
  isPending,
  onClose,
  onSearchChange,
  onShare,
  searchInput,
}: ShareAssetModalProps) => {
  return (
    <Modal labelledBy={ASSET_DIALOG.shareModalTitleId} onClose={onClose}>
      <div className="share-modal-header">
        <div>
          <p className="assets-kicker">{ASSET_TEXT.shareKicker}</p>
          <h2 id={ASSET_DIALOG.shareModalTitleId}>{ASSET_TEXT.shareTitle}</h2>
        </div>
        <button type="button" className="share-modal-close" onClick={onClose}>
          {ASSET_TEXT.shareClose}
        </button>
      </div>

      <TextField
        id="share-user-search"
        type="search"
        label={ASSET_TEXT.shareSearchLabel}
        value={searchInput}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder={ASSET_TEXT.shareSearchPlaceholder}
        wrapperClassName="asset-control share-search-control"
      />

      {isLoading ? <p className="asset-feedback">{ASSET_TEXT.shareLoading}</p> : null}
      {isError ? (
        <p className="asset-feedback error">{error || ASSET_TEXT.shareLoadError}</p>
      ) : null}
      {error && !isError ? <p className="asset-feedback error">{error}</p> : null}

      {!isLoading && !isError ? (
        <div className="share-user-list">
          {existingUsers.length === 0 ? (
            <p className="share-user-empty">{ASSET_TEXT.shareEmpty}</p>
          ) : (
            existingUsers.map((existingUser) => (
              <div key={existingUser.id} className="share-user-card">
                <div>
                  <strong>{existingUser.name}</strong>
                  <p>{existingUser.email}</p>
                </div>
                <button
                  type="button"
                  className="asset-share-btn"
                  onClick={() => onShare(assetId, existingUser)}
                  disabled={isPending}
                >
                  {isPending ? ASSET_TEXT.sharing : ASSET_TEXT.share}
                </button>
              </div>
            ))
          )}
        </div>
      ) : null}
    </Modal>
  )
}

export default ShareAssetModal
