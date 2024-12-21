// toastConfig.js
import { toast } from 'react-toastify';

// Icons for different toast types
const ToastIcon = ({ type }) => {
  const iconColor = {
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6'
  }[type];

  return (
    <svg 
      className="toast-icon" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke={iconColor} 
      strokeWidth="2"
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      {type === 'success' && (
        <path d="M20 6L9 17L4 12" />
      )}
      {type === 'error' && (
        <>
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </>
      )}
      {type === 'warning' && (
        <>
          <path d="M12 9v4" />
          <path d="M12 17h.01" />
          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        </>
      )}
      {type === 'info' && (
        <>
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4" />
          <path d="M12 8h.01" />
        </>
      )}
    </svg>
  );
};

// Toast configuration options
const toastConfig = {
  success: (message) => {
    toast.success(
      <div className="toast-content">
        <ToastIcon type="success" />
        <p className="toast-message">{message}</p>
      </div>,
      {
        className: 'custom-toast custom-toast-success',
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      }
    );
  },
  error: (message) => {
    toast.error(
      <div className="toast-content">
        <ToastIcon type="error" />
        <p className="toast-message">{message}</p>
      </div>,
      {
        className: 'custom-toast custom-toast-error',
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      }
    );
  },
  warning: (message) => {
    toast.warning(
      <div className="toast-content">
        <ToastIcon type="warning" />
        <p className="toast-message">{message}</p>
      </div>,
      {
        className: 'custom-toast custom-toast-warning',
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      }
    );
  },
  info: (message) => {
    toast.info(
      <div className="toast-content">
        <ToastIcon type="info" />
        <p className="toast-message">{message}</p>
      </div>,
      {
        className: 'custom-toast custom-toast-info',
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      }
    );
  }
};

export default toastConfig;