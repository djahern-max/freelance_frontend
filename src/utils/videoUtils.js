// src/utils/videoUtils.js
import api from './api';

export const getFullAssetUrl = (path) => {
    if (!path) return null;

    // If it's already a full URL (starts with http:// or https://)
    if (path.startsWith('http')) {
        return path;
    }

    // Digital Ocean Spaces configuration
    const spacesRegion = 'nyc3';
    const spacesBucket = 'freelance-wtf-storage';

    // Construct the URL using the Spaces configuration 
    return `https://${spacesBucket}.${spacesRegion}.digitaloceanspaces.com/${path}`;
};

export const deleteVideo = async (videoId) => {
    try {
        const response = await api.delete(`/videos/${videoId}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting video:', error);
        throw error;
    }
};