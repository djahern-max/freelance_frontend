/**
 * Transmit a specific message to Analytics Hub
 * @param {number} conversationId - ID of the conversation
 * @param {number} messageId - ID of the specific message to transmit
 * @returns {Promise<Object>} - Status of the transmission
 */
export const transmitMessageToAnalyticsHub = async (conversationId, messageId) => {
    try {
        console.log(`Transmitting message ${messageId} in conversation ${conversationId} to Analytics Hub`);

        const response = await apiClient.post(
            `/api/conversations/${conversationId}/messages/${messageId}/transmit`,
            { destination: 'analytics-hub' }
        );

        console.log('Transmission successful:', response.data);
        return response.data;
    } catch (error) {
        console.error('Failed to transmit message:', error);
        // Add more detailed error information
        if (error.response) {
            console.error('Response data:', error.response.data);
            console.error('Response status:', error.response.status);
        }
        throw error;
    }
};