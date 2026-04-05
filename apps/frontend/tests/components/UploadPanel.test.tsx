import { createRef } from 'react'
import { screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import UploadPanel from '@/components/UploadPanel'
import { renderWithProviders } from '../test-utils'

const createFile = (name: string, type = 'image/png', size = 1024) =>
  new File([new Uint8Array(size)], name, { type })

describe('UploadPanel', () => {
  it('shows selected files and calls the upload actions', async () => {
    const user = userEvent.setup()
    const handleFileSelection = vi.fn()
    const handleDrop = vi.fn()
    const onPickFiles = vi.fn()
    const onUpload = vi.fn()
    const removeSelectedFile = vi.fn()
    const setIsDragging = vi.fn()

    renderWithProviders(
      <UploadPanel
        handleDrop={handleDrop}
        handleFileSelection={handleFileSelection}
        inputRef={createRef<HTMLInputElement>()}
        isDragging={false}
        onPickFiles={onPickFiles}
        onUpload={onUpload}
        removeSelectedFile={removeSelectedFile}
        selectedFiles={[createFile('poster.png')]}
        setIsDragging={setIsDragging}
        uploadPending={false}
        uploadSuccess={true}
      />
    )

    await user.click(screen.getByRole('button', { name: 'Choose files' }))
    await user.click(screen.getByRole('button', { name: 'Upload assets' }))
    await user.click(screen.getByRole('button', { name: 'Remove' }))

    expect(screen.getByText('poster.png')).toBeInTheDocument()
    expect(screen.getByText('Assets uploaded successfully.')).toBeInTheDocument()
    expect(onPickFiles).toHaveBeenCalled()
    expect(onUpload).toHaveBeenCalled()
    expect(removeSelectedFile).toHaveBeenCalledWith(0)
  })

  it('forwards drag and file input events', () => {
    const handleFileSelection = vi.fn()
    const handleDrop = vi.fn()
    const setIsDragging = vi.fn()

    renderWithProviders(
      <UploadPanel
        handleDrop={handleDrop}
        handleFileSelection={handleFileSelection}
        inputRef={createRef<HTMLInputElement>()}
        isDragging={false}
        onPickFiles={vi.fn()}
        onUpload={vi.fn()}
        removeSelectedFile={vi.fn()}
        selectedFiles={[]}
        setIsDragging={setIsDragging}
        uploadPending={false}
        uploadSuccess={false}
      />
    )

    const dropzone = screen.getByText('Drop images or videos here').closest('div')
    const input = document.querySelector('input[type="file"]')

    if (!dropzone || !input) {
      throw new Error('Upload elements not found')
    }

    fireEvent.dragEnter(dropzone)
    fireEvent.dragOver(dropzone)
    fireEvent.change(input, { target: { files: [createFile('clip.mp4', 'video/mp4')] } })
    fireEvent.drop(dropzone, { dataTransfer: { files: [createFile('clip.mp4', 'video/mp4')] } })

    expect(setIsDragging).toHaveBeenCalledWith(true)
    expect(handleFileSelection).toHaveBeenCalled()
    expect(handleDrop).toHaveBeenCalled()
  })
})
