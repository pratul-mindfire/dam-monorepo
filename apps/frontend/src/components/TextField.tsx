import type { InputHTMLAttributes } from 'react'

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  error?: string
  label: string
  labelClassName?: string
  wrapperClassName?: string
}

const TextField = ({
  error,
  id,
  label,
  labelClassName,
  wrapperClassName = 'form-group',
  ...props
}: TextFieldProps) => {
  return (
    <div className={wrapperClassName}>
      <label htmlFor={id} className={labelClassName}>
        {label}
      </label>
      <input id={id} {...props} />
      {error ? <p className="error-text">{error}</p> : null}
    </div>
  )
}

export default TextField
