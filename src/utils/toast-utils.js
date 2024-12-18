import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';
import { toast } from 'react-toastify';

const createToastContent = (message, Icon) => ({
  render: () => (
    <div className="toast-content">
      <Icon className="toast-icon" />
      <p className="toast-message">{message}</p>
    </div>
  ),
});

export const showToast = {
  success: (message) => {
    toast(createToastContent(message, CheckCircle), {
      className: 'custom-toast custom-toast-success',
      progressClassName: 'toast-progress',
    });
  },
  error: (message) => {
    toast(createToastContent(message, XCircle), {
      className: 'custom-toast custom-toast-error',
      progressClassName: 'toast-progress',
    });
  },
  warning: (message) => {
    toast(createToastContent(message, AlertCircle), {
      className: 'custom-toast custom-toast-warning',
      progressClassName: 'toast-progress',
    });
  },
  info: (message) => {
    toast(createToastContent(message, Info), {
      className: 'custom-toast custom-toast-info',
      progressClassName: 'toast-progress',
    });
  },
};
