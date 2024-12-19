import { useState } from 'react';
import api from './api';

export const handleSnagTicket = async ({
  requestId,
  message,
  videoIds = [],
  includeProfile = false,
  onSuccess,
  onError,
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
    let errorMessage = 'Failed to snag request';

    // Handle specific error cases
    if (error.response?.status === 400) {
      if (error.response.data?.detail?.includes('Only open requests')) {
        errorMessage =
          'This request is no longer available for snagging. Only open requests can be snagged.';
      } else if (error.response.data?.detail?.includes('already snagged')) {
        errorMessage = 'You have already snagged this request.';
      } else {
        errorMessage = error.response.data?.detail || 'Invalid request';
      }
    } else if (error.response?.status === 403) {
      errorMessage = 'Only developers can snag requests';
    } else {
      errorMessage = api.helpers.handleError(error);
    }

    if (onError) {
      onError(errorMessage);
    }
    throw new Error(errorMessage);
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
