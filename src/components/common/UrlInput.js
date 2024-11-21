// components/common/UrlInput.js
import { useState } from 'react';
import styles from './UrlInput.module.css';

// Helper function to format and validate URLs
const formatURL = (input) => {
  try {
    let url = input.trim();

    if (!/^https?:\/\//i.test(url)) {
      url = 'https://' + url;
    }

    url = url.replace(/\/+$/, '');

    const domainRegex = /^https?:\/\/[a-zA-Z0-9][a-zA-Z0-9-._]+\.[a-zA-Z]{2,}/;
    if (!domainRegex.test(url)) {
      return { isValid: false, url: input, error: 'Please enter a valid URL' };
    }

    new URL(url);
    return { isValid: true, url, error: null };
  } catch (error) {
    return { isValid: false, url: input, error: 'Please enter a valid URL' };
  }
};

const UrlInput = ({
  label,
  value,
  onChange,
  onValidation,
  placeholder,
  required = false,
}) => {
  const [error, setError] = useState('');
  const [isDirty, setIsDirty] = useState(false);

  const handleChange = (e) => {
    const input = e.target.value;
    setIsDirty(true);

    if (input.trim()) {
      const result = formatURL(input);

      if (result.isValid) {
        onChange(result.url);
        setError('');
        onValidation?.(true);
      } else {
        onChange(input);
        setError(result.error);
        onValidation?.(false);
      }
    } else {
      onChange(input);
      setError('');
      onValidation?.(true);
    }
  };

  const getHelperText = () => {
    if (!isDirty) return 'Example: www.example.com';
    return error;
  };

  return (
    <div className={styles.formGroup}>
      <div className={styles.labelContainer}>
        <label className={styles.label}>{label}</label>
        {required && <span className={styles.required}>*</span>}
      </div>
      <input
        type="text"
        className={`${styles.input} ${
          error && isDirty ? styles.inputError : ''
        }`}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        required={required}
      />
      {getHelperText() && (
        <p className={`${styles.helpText} ${error ? styles.errorText : ''}`}>
          {getHelperText()}
        </p>
      )}
    </div>
  );
};

export default UrlInput;
