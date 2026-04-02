import { useCallback, useRef, useState, type ChangeEvent, type DragEvent } from 'react'

export const useFileSelection = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const mergeFiles = useCallback((incomingFiles: File[]) => {
    setSelectedFiles((currentFiles) => {
      const nextFiles = [...currentFiles]

      incomingFiles.forEach((file) => {
        const alreadyAdded = nextFiles.some(
          (existingFile) =>
            existingFile.name === file.name &&
            existingFile.size === file.size &&
            existingFile.lastModified === file.lastModified
        )

        if (!alreadyAdded) {
          nextFiles.push(file)
        }
      })

      return nextFiles
    })
  }, [])

  const handleFileSelection = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      mergeFiles(Array.from(event.target.files || []))
      event.target.value = ''
    },
    [mergeFiles]
  )

  const handleDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault()
      setIsDragging(false)
      mergeFiles(Array.from(event.dataTransfer.files || []))
    },
    [mergeFiles]
  )

  return {
    inputRef,
    selectedFiles,
    setSelectedFiles,
    isDragging,
    setIsDragging,
    handleFileSelection,
    handleDrop,
    removeSelectedFile: (indexToRemove: number) => {
      setSelectedFiles((currentFiles) =>
        currentFiles.filter((_, index) => index !== indexToRemove)
      )
    },
  }
}

export default useFileSelection
