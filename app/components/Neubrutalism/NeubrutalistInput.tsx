import React from 'react';
import styles from './Neubrutalism.module.css';

interface NeubrutalistInputProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
}

export const NeubrutalistInput: React.FC<NeubrutalistInputProps> = ({
  type = 'text',
  placeholder,
  value,
  onChange,
  label,
  required = false,
  disabled = false,
  error,
}) => {
  return (
    <div className={styles.neuInputWrapper}>
      {label && (
        <label className={styles.neuInputLabel}>
          {label}
          {required && <span className={styles.neuInputRequired}>*</span>}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={`${styles.neuInput} ${error ? styles.neuInputError : ''}`}
      />
      {error && <span className={styles.neuInputErrorText}>{error}</span>}
    </div>
  );
};

interface NeubrutalistTextareaProps {
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  rows?: number;
  error?: string;
}

export const NeubrutalistTextarea: React.FC<NeubrutalistTextareaProps> = ({
  placeholder,
  value,
  onChange,
  label,
  required = false,
  disabled = false,
  rows = 4,
  error,
}) => {
  return (
    <div className={styles.neuInputWrapper}>
      {label && (
        <label className={styles.neuInputLabel}>
          {label}
          {required && <span className={styles.neuInputRequired}>*</span>}
        </label>
      )}
      <textarea
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        rows={rows}
        className={`${styles.neuTextarea} ${error ? styles.neuInputError : ''}`}
      />
      {error && <span className={styles.neuInputErrorText}>{error}</span>}
    </div>
  );
};
