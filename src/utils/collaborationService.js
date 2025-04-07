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
    const response = await collaborationApi.get(
        `/sessions/${sessionId}`,
        withAuth(accessToken)
    );
    return response.data;
};

// Fetch messages for a session
export const fetchMessages = async (sessionId, accessToken, lastMessageId = 0) => {
    const response = await collaborationApi.get(
        `/sessions/${sessionId}/messages`,
        {
            ...withAuth(accessToken),
            params: { after_id: lastMessageId }
        }
    );
    return response.data;
};

// Send a new message
export const sendMessage = async (sessionId, accessToken, messageData) => {
    const response = await collaborationApi.post(
        `/sessions/${sessionId}/messages`,
        messageData,
        withAuth(accessToken)
    );
    return response.data;
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
export const updateSessionStatus = async (sessionId, accessToken, newStatus) => {
    const response = await collaborationApi.patch(
        `/sessions/${sessionId}/status`,
        { status: newStatus },
        withAuth(accessToken)
    );
    return response.data;
};

// Generate access link for external user
export const generateAccessLink = async (sessionId, email) => {
    const response = await collaborationApi.post(
        `/sessions/${sessionId}/access`,
        { email }
    );
    return response.data;
};