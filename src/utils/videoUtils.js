// src/utils/videoUtils.js
import api from './api';

export const getFullAssetUrl = (path) => {
    if (!path) {
        console.log('Empty path received in getFullAssetUrl');
        return null;
    }

    // If it's already a full URL (starts with http:// or https://)
    if (path.startsWith('http')) {
        return path;
    }

    // Remove any leading slash if present
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;

    // Digital Ocean Spaces configuration
    const spacesRegion = 'nyc3';
    const spacesBucket = 'freelance-wtf-storage';

    // Construct the URL using the Spaces configuration
    const fullUrl = `https://${spacesBucket}.${spacesRegion}.digitaloceanspaces.com/${cleanPath}`;

    // For debugging
    console.log(`Converted ${path} to ${fullUrl}`);

    return fullUrl;
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