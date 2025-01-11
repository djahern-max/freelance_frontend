import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const toastConfig = {
  position: toast.POSITION.TOP_RIGHT,
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  theme: 'light',
  style: {
    background: '#fff',
    color: '#333',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    fontSize: '14px',
  }
};

// Custom toast styles for different types
export const toastStyles = {
  success: {
    style: {
      ...toastConfig.style,
      background: '#3b82f6', // Tailwind blue-500
      border: '1px solid #2563eb', // Tailwind blue-600
      color: '#ffffff', // White text for better contrast
    },
    icon: '✓' // Changed to checkmark for better visibility on blue
  },
  error: {
    style: {
      ...toastConfig.style,
      background: '#FDEDED',
      border: '1px solid #EF5350',
    },
    icon: '❌'
  },
  info: {
    style: {
      ...toastConfig.style,
      background: '#E8F4FD',
      border: '1px solid #2196F3',
    },
    icon: 'ℹ️'
  },
  warning: {
    style: {
      ...toastConfig.style,
      background: '#FFF4E5',
      border: '1px solid #FF9800', å
    },
    icon: '⚠️'
  }
};

// Custom toast functions remain the same
export const customToast = {
  success: (message) => toast.success(message, { ...toastConfig, ...toastStyles.success }),
  error: (message) => toast.error(message, { ...toastConfig, ...toastStyles.error }),
  info: (message) => toast.info(message, { ...toastConfig, ...toastStyles.info }),
  warning: (message) => toast.warning(message, { ...toastConfig, ...toastStyles.warning })
};