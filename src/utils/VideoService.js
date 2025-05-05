// src/utils/videoService.js (keep this one)
import api from './api';

export const getFullAssetUrl = (path) => {
    if (!path) return null;

    // If it's already a full URL (starts with http:// or https://)
    if (path.startsWith('http')) {
        return path;
    }

    // DigitalOcean Spaces configuration
    const spacesRegion = 'nyc3';
    const spacesBucket = 'danejahern';
    const folderPrefix = 'danejahern'; // Add this folder prefix

    // Construct the URL using the Spaces configuration with the folder prefix
    return `https://${spacesBucket}.${spacesRegion}.digitaloceanspaces.com/${folderPrefix}/${path}`;
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

// Additional video-related functions can go here