import type { PropsWithChildren, MouseEvent } from 'react'

type ModalProps = PropsWithChildren<{
  labelledBy: string
  onClose: () => void
  panelClassName?: string
}>

const Modal = ({ children, labelledBy, onClose, panelClassName = 'share-modal' }: ModalProps) => {
  const stopPropagation = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation()
  }

  return (
    <div className="share-modal-backdrop" role="presentation" onClick={onClose}>
      <section
        className={panelClassName}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        onClick={stopPropagation}
      >
        {children}
      </section>
    </div>
  )
}

export default Modal
