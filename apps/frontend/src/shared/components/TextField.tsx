import type { InputHTMLAttributes } from 'react'

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  error?: string
  label: string
  wrapperClassName?: string
}

const TextField = ({ error, label, wrapperClassName = 'form-group', ...props }: TextFieldProps) => {
  return (
    <div className={wrapperClassName}>
      <label>{label}</label>
      <input {...props} />
      {error ? <p className="error-text">{error}</p> : null}
    </div>
  )
}

export default TextField
