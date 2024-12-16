// src/utils/snagTicket.js
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

    // Check subscription status first
    const subscriptionRes = await api.get('/payments/subscription-status');
    if (subscriptionRes.data.status !== 'active') {
      if (onSubscriptionNeeded) {
        onSubscriptionNeeded();
      }
      return;
    }

    // Create the conversation with initial message
    const conversationRes = await api.post('/conversations/', {
      request_id: requestId,
      initial_message: message,
      video_ids: videoIds,
      include_profile: includeProfile,
    });

    if (onSuccess) {
      onSuccess(conversationRes.data);
    }

    return conversationRes.data;
  } catch (error) {
    console.error('Failed to snag ticket:', error);

    if (error.response?.status === 403) {
      if (onSubscriptionNeeded) {
        onSubscriptionNeeded();
      }
    } else {
      const errorMessage = api.helpers.handleError(error);
      if (onError) {
        onError(errorMessage);
      }
    }

    throw error;
  } finally {
    if (onLoadingChange) {
      onLoadingChange(false);
    }
  }
};

export const useSnagTicket = (navigate) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const snagTicket = async (requestId, data) => {
    return handleSnagTicket({
      requestId,
      ...data,
      onSuccess: (conversation) => {
        navigate(`/conversations/${conversation.id}`);
      },
      onError: (message) => {
        setError(message);
      },
      onSubscriptionNeeded: () => {
        navigate('/subscription');
      },
      onLoadingChange: setLoading,
    });
  };

  return {
    snagTicket,
    loading,
    error,
    setError, // Expose this to allow clearing errors
  };
};
