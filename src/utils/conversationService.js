// In utils/conversationService.js

/**
 * Transmit a specific message to Analytics Hub
 * @param {number} conversationId - ID of the conversation
 * @param {number} messageId - ID of the specific message to transmit
 * @returns {Promise<Object>} - Status of the transmission
 */
export const transmitMessageToAnalyticsHub = async (conversationId, messageId) => {
    try {
        const response = await apiClient.post(
            `/api/conversations/${conversationId}/messages/${messageId}/transmit`,
            { destination: 'analytics-hub' }
        );
        return response.data;
    } catch (error) {
        console.error('Failed to transmit message:', error);
        throw error;
    }
};