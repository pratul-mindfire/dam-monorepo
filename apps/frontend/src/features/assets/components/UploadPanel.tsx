import type { ChangeEvent, DragEvent, RefObject } from 'react'
import { ASSET_TEXT } from '@/constants'
import { formatBytes } from '@/utils/assets'

type UploadPanelProps = {
  handleDrop: (event: DragEvent<HTMLDivElement>) => void
  handleFileSelection: (event: ChangeEvent<HTMLInputElement>) => void
  inputRef: RefObject<HTMLInputElement | null>
  isDragging: boolean
  onPickFiles: () => void
  onUpload: () => void
  removeSelectedFile: (index: number) => void
  selectedFiles: File[]
  setIsDragging: (value: boolean) => void
  uploadError?: string
  uploadPending: boolean
  uploadSuccess: boolean
}

const UploadPanel = ({
  handleDrop,
  handleFileSelection,
  inputRef,
  isDragging,
  onPickFiles,
  onUpload,
  removeSelectedFile,
  selectedFiles,
  setIsDragging,
  uploadError,
  uploadPending,
  uploadSuccess,
}: UploadPanelProps) => {
  return (
    <section className="assets-upload-panel">
      <div
        className={`upload-dropzone ${isDragging ? 'dragging' : ''}`}
        onDragEnter={(event) => {
          event.preventDefault()
          setIsDragging(true)
        }}
        onDragOver={(event) => {
          event.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={(event) => {
          event.preventDefault()

          if (event.currentTarget === event.target) {
            setIsDragging(false)
          }
        }}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          className="upload-input"
          type="file"
          multiple
          onChange={handleFileSelection}
        />

        <div className="upload-copy">
          <span className="upload-badge">{ASSET_TEXT.uploadBadge}</span>
          <h2>{ASSET_TEXT.uploadTitle}</h2>
          <p>{ASSET_TEXT.uploadSubtitle}</p>
        </div>

        <div className="upload-actions">
          <button type="button" className="ghost-upload-btn" onClick={onPickFiles}>
            {ASSET_TEXT.chooseFiles}
          </button>
          <button
            type="button"
            className="primary-upload-btn"
            onClick={onUpload}
            disabled={selectedFiles.length === 0 || uploadPending}
          >
            {uploadPending ? ASSET_TEXT.uploading : ASSET_TEXT.upload}
          </button>
        </div>
      </div>

      <div className="upload-queue-panel">
        <div className="upload-queue-header">
          <h3>{ASSET_TEXT.queueTitle}</h3>
          <span>{selectedFiles.length} file(s)</span>
        </div>

        {selectedFiles.length === 0 ? (
          <p className="queue-empty">{ASSET_TEXT.queueEmpty}</p>
        ) : (
          <div className="selected-file-list">
            {selectedFiles.map((file, index) => (
              <div key={`${file.name}-${file.lastModified}-${index}`} className="selected-file-card">
                <div>
                  <strong>{file.name}</strong>
                  <p>
                    {file.type || ASSET_TEXT.unknownFileType} · {formatBytes(file.size)}
                  </p>
                </div>
                <button type="button" onClick={() => removeSelectedFile(index)}>
                  {ASSET_TEXT.removeFile}
                </button>
              </div>
            ))}
          </div>
        )}

        {uploadError ? <p className="asset-feedback error">{uploadError}</p> : null}
        {uploadSuccess ? <p className="asset-feedback success">{ASSET_TEXT.uploadSuccess}</p> : null}
      </div>
    </section>
  )
}

export default UploadPanel
