import { useCallback, useEffect } from 'react'
import AssetsHero from '@/components/AssetsHero'
import AssetsTable from '@/components/AssetsTable'
import ShareAssetModal from '@/components/ShareAssetModal'
import UploadPanel from '@/components/UploadPanel'
import { ASSET_TEXT } from '@/constants'
import useAssetFilters from '@/hooks/useAssetFilters'
import { useAssets } from '@/hooks/useAssets'
import { useAuth } from '@/hooks/useAuth'
import useFileSelection from '@/hooks/useFileSelection'
import useShareAsset from '@/hooks/useShareAsset'
import '@/styles/assets.css'

const Assets = () => {
  const { user } = useAuth()
  const {
    clearFilters,
    hasFilters,
    limit,
    page,
    queryParams,
    searchInput,
    setLimit,
    setPage,
    setSearchInput,
    setStatusFilter,
    setTypeFilter,
    statusFilter,
    typeFilter,
  } = useAssetFilters()
  const {
    handleDrop,
    handleFileSelection,
    inputRef,
    isDragging,
    removeSelectedFile,
    selectedFiles,
    setIsDragging,
    setSelectedFiles,
  } = useFileSelection()
  const {
    data,
    deleteMutation,
    error,
    isError,
    isFetching,
    isLoading,
    shareMutation,
    uploadMutation,
  } = useAssets(queryParams)
  const {
    assetId: shareAssetId,
    close: closeSharePicker,
    existingUsers,
    open: openSharePicker,
    searchInput: shareSearchInput,
    setSearchInput: setShareSearchInput,
    share: handleShare,
    shareError,
    shareFeedback,
    usersQuery,
  } = useShareAsset(shareMutation)

  const assets = data?.data ?? []
  const meta = data?.meta
  const totalAssets = meta?.total ?? 0
  const currentPage = meta?.page ?? page
  const currentLimit = meta?.limit ?? limit
  const totalPages = meta?.totalPages ?? 0

  useEffect(() => {
    if (!meta) {
      return
    }

    if (totalPages === 0 && page !== 1) {
      setPage(1)
      return
    }

    if (totalPages > 0 && page > totalPages) {
      setPage(totalPages)
    }
  }, [meta, page, setPage, totalPages])

  const handleUpload = useCallback(async () => {
    if (selectedFiles.length === 0 || uploadMutation.isPending) {
      return
    }

    await uploadMutation.mutateAsync(selectedFiles)
    setSelectedFiles([])
  }, [selectedFiles, setSelectedFiles, uploadMutation])

  const handleDelete = useCallback(
    async (assetId: string) => {
      if (deleteMutation.isPending) {
        return
      }

      const confirmed = window.confirm(ASSET_TEXT.deleteConfirm)

      if (!confirmed) {
        return
      }

      await deleteMutation.mutateAsync(assetId)
    },
    [deleteMutation]
  )

  return (
    <div className="assets-page">
      <AssetsHero
        currentPage={currentPage}
        totalAssets={totalAssets}
        totalPages={totalPages}
        visibleAssets={assets.length}
      />

      <UploadPanel
        handleDrop={handleDrop}
        handleFileSelection={handleFileSelection}
        inputRef={inputRef}
        isDragging={isDragging}
        onPickFiles={() => inputRef.current?.click()}
        onUpload={handleUpload}
        removeSelectedFile={removeSelectedFile}
        selectedFiles={selectedFiles}
        setIsDragging={setIsDragging}
        uploadError={(uploadMutation.error as Error | null)?.message || undefined}
        uploadPending={uploadMutation.isPending}
        uploadSuccess={uploadMutation.isSuccess}
      />

      <AssetsTable
        assets={assets}
        currentLimit={currentLimit}
        currentPage={currentPage}
        deletePending={deleteMutation.isPending}
        error={isError ? (error as Error)?.message || ASSET_TEXT.assetsLoadError : undefined}
        hasFilters={hasFilters}
        isFetching={isFetching}
        isLoading={isLoading}
        limit={limit}
        onClearFilters={clearFilters}
        onDelete={handleDelete}
        onLimitChange={setLimit}
        onNextPage={() =>
          setPage((current) => (totalPages === 0 ? current : Math.min(totalPages, current + 1)))
        }
        onOpenShare={openSharePicker}
        onPreviousPage={() => setPage((current) => Math.max(1, current - 1))}
        onSearchChange={setSearchInput}
        onStatusChange={setStatusFilter}
        onTypeChange={setTypeFilter}
        searchInput={searchInput}
        shareError={shareError}
        shareFeedback={shareFeedback}
        sharePending={shareMutation.isPending}
        statusFilter={statusFilter}
        totalAssets={totalAssets}
        totalPages={totalPages}
        typeFilter={typeFilter}
        userId={user?.id}
      />

      {shareAssetId ? (
        <ShareAssetModal
          assetId={shareAssetId}
          error={shareError[shareAssetId]}
          existingUsers={existingUsers}
          isError={usersQuery.isError}
          isLoading={usersQuery.isLoading}
          isPending={shareMutation.isPending}
          onClose={closeSharePicker}
          onSearchChange={setShareSearchInput}
          onShare={handleShare}
          searchInput={shareSearchInput}
        />
      ) : null}
    </div>
  )
}

export default Assets
