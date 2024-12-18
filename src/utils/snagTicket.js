import { useState } from 'react';
import api from './api';

export const handleSnagTicket = async ({
  requestId,
  message,
  videoIds = [],
  includeProfile = false,
  onSuccess,
  onError,
  onSubscriptionNeeded,
  onLoadingChange,
}) => {
  try {
    if (onLoadingChange) {
      onLoadingChange(true);
    }

    // Create the snagged request
    const snaggedRequestRes = await api.post('/snagged-requests/', {
      request_id: requestId,
      message,
      video_ids: videoIds,
      profile_link: includeProfile,
    });

    if (onSuccess) {
      onSuccess(snaggedRequestRes.data);
    }

    return snaggedRequestRes.data;
  } catch (error) {
    console.error('Failed to snag request:', error);
    const errorMessage = api.helpers.handleError(error);
    if (onError) {
      onError(errorMessage);
    }
    throw error;
  } finally {
    if (onLoadingChange) {
      onLoadingChange(false);
    }
  }
};

export const useSnagTicket = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const snagTicket = async (requestId, data) => {
    return handleSnagTicket({
      requestId,
      ...data,
      onSuccess: () => {
        // Success is handled by the component
      },
      onError: (message) => {
        setError(message);
      },
      onLoadingChange: setLoading,
    });
  };

  return {
    snagTicket,
    loading,
    error,
    setError,
  };
};
