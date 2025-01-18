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
      background: '#EDF7ED',
      border: '1px solid #4CAF50',
    },
    icon: '🎉'
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
      border: '1px solid #FF9800',
    },
    icon: '⚠️'
  }
};

// Custom toast functions
export const customToast = {
  success: (message) => toast.success(message, { ...toastConfig, ...toastStyles.success }),
  error: (message) => toast.error(message, { ...toastConfig, ...toastStyles.error }),
  info: (message) => toast.info(message, { ...toastConfig, ...toastStyles.info }),
  warning: (message) => toast.warning(message, { ...toastConfig, ...toastStyles.warning })
};