// CollaborationService.js
// API service for the collaboration portal
import axios from 'axios';

const API_BASE_URL = '/api/collaboration';

// Configure axios instance with default headers
const collaborationApi = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Helper to add access token to requests
const withAuth = (accessToken) => {
    return {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    };
};

// Fetch session data
export const fetchSessionData = async (sessionId, accessToken) => {
    try {
        const response = await fetch(`/api/collaboration/sessions/${sessionId}?token=${accessToken}`);

        if (!response.ok) {
            throw new Error(`Failed to fetch session: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching session data:', error);
        throw error;
    }
};
// Fetch messages for a session
export const fetchMessages = async (sessionId, accessToken, afterId = 0) => {
    try {
        const response = await fetch(
            `/api/collaboration/sessions/${sessionId}/messages?token=${accessToken}&after_id=${afterId}`
        );

        if (!response.ok) {
            throw new Error(`Failed to fetch messages: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching messages:', error);
        throw error;
    }
};

// Send a new message
export const sendMessage = async (sessionId, accessToken, messageData) => {
    try {
        const response = await fetch(
            `/api/collaboration/sessions/${sessionId}/messages?token=${accessToken}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(messageData)
            }
        );

        if (!response.ok) {
            throw new Error(`Failed to send message: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error sending message:', error);
        throw error;
    }
};
// Upload file attachment
export const uploadAttachment = async (sessionId, accessToken, file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await collaborationApi.post(
        `/sessions/${sessionId}/attachments`,
        formData,
        {
            ...withAuth(accessToken),
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        }
    );
    return response.data;
};

// Update session status
export const updateSessionStatus = async (sessionId, accessToken, status) => {
    try {
        const response = await fetch(
            `/api/collaboration/sessions/${sessionId}/status?token=${accessToken}`,
            {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status })
            }
        );

        if (!response.ok) {
            throw new Error(`Failed to update status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error updating session status:', error);
        throw error;
    }
};
// Generate access link for external user
export const generateAccessLink = async (sessionId, email) => {
    const response = await collaborationApi.post(
        `/sessions/${sessionId}/access`,
        { email }
    );
    return response.data;
};