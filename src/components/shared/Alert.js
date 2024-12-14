import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import styles from './Alert.module.css';

const Alert = ({
  message,
  type = 'success',
  onClose,
  autoClose = true,
  duration = 3000,
  showRedirectMessage = false,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        setIsExiting(true);
        setTimeout(() => {
          setIsVisible(false);
          if (onClose) onClose();
        }, 300); // Match animation duration
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, onClose]);

  if (!isVisible) return null;

  const alertClasses = `
    ${styles.alert}
    ${styles[type]}
    ${isExiting ? styles.exitAnimation : ''}
  `;

  return (
    <div className={alertClasses}>
      <div className={styles.content}>
        <div className={styles.message}>{message}</div>
        {showRedirectMessage && (
          <div className={styles.redirectMessage}>
            Redirecting to dashboard...
          </div>
        )}
      </div>
      {!autoClose && (
        <button
          onClick={() => {
            setIsExiting(true);
            setTimeout(() => {
              setIsVisible(false);
              if (onClose) onClose();
            }, 300);
          }}
          className={styles.closeButton}
        >
          <X className={styles.closeIcon} />
        </button>
      )}
    </div>
  );
};

export default Alert;
