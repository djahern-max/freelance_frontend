// src/utils/videoService.js
import apiService from './apiService';

export const deleteVideo = async (videoId) => {
    try {
        const response = await apiService.delete(`/videos/${videoId}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting video:', error);
        throw error;
    }
};