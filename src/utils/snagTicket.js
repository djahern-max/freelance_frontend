import { useState } from 'react';
import api from './api';

export const useSnagTicket = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const snagTicket = async (requestId, formData) => {
    setLoading(true);
    setError(null);

    try {


      // First create the snagged request
      const response = await api.post('/snagged-requests/', {
        request_id: requestId,
        message: formData.message,
        video_ids: formData.video_ids,
        profile_link: formData.include_profile,
        include_profile: formData.include_profile
      });



      return response.data;
    } catch (error) {
      console.error('Error in snagTicket:', error);
      const errorMessage = error.response?.data?.detail || 'Failed to snag request';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    snagTicket,
    loading,
    error,
    setError
  };
};