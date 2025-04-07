// CollaborationPortal.js
// Main container component for the collaboration feature
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MessageThread } from './MessageThread';
import { MessageInput } from './MessageInput';
import { SessionHeader } from './SessionHeader';
import { fetchSessionData, fetchMessages, sendMessage, updateSessionStatus } from '../../utils/collaborationService';
import styles from './CollaborationPortal.module.css';

const CollaborationPortal = () => {
    const { sessionId, accessToken } = useParams();
    const navigate = useNavigate();
    const [session, setSession] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [pollInterval, setPollInterval] = useState(null);

    // Load session data initially
    useEffect(() => {
        const loadSessionData = async () => {
            try {
                setLoading(true);
                const sessionData = await fetchSessionData(sessionId, accessToken);
                setSession(sessionData);

                // Find current user in participants
                const user = sessionData.participants.find(p => p.is_current_user);
                setCurrentUser(user);

                // Load initial messages
                const messageData = await fetchMessages(sessionId, accessToken);
                setMessages(messageData);

                setLoading(false);
            } catch (err) {
                setError('Failed to load collaboration session. The link may be invalid or expired.');
                setLoading(false);
            }
        };

        loadSessionData();
    }, [sessionId, accessToken]);

    // Set up polling for new messages
    // Note: This would be replaced with WebSockets in a future implementation
    useEffect(() => {
        if (session && session.status !== 'resolved') {
            const interval = setInterval(async () => {
                try {
                    const messageData = await fetchMessages(sessionId, accessToken, messages.length > 0 ? messages[messages.length - 1].id : 0);
                    if (messageData.length > 0) {
                        setMessages(prev => [...prev, ...messageData]);
                    }
                } catch (err) {
                    console.error('Failed to poll for new messages', err);
                }
            }, 5000); // Poll every 5 seconds

            setPollInterval(interval);
            return () => clearInterval(interval);
        } else if (pollInterval) {
            clearInterval(pollInterval);
        }
    }, [session, messages, sessionId, accessToken]);

    // Handle sending a new message
    const handleSendMessage = async (content, attachments = []) => {
        try {
            const newMessage = await sendMessage(sessionId, accessToken, {
                content,
                attachments
            });

            setMessages(prev => [...prev, newMessage]);
        } catch (err) {
            setError('Failed to send message. Please try again.');
        }
    };

    // Handle status change
    const handleStatusChange = async (newStatus) => {
        try {
            const updatedSession = await updateSessionStatus(sessionId, accessToken, newStatus);
            setSession(updatedSession);

            // Add system message about status change
            setMessages(prev => [
                ...prev,
                {
                    id: `status-${Date.now()}`,
                    is_system: true,
                    content: `Status changed to: ${newStatus}`,
                    created_at: new Date().toISOString()
                }
            ]);

            // If resolved, stop polling
            if (newStatus === 'resolved' && pollInterval) {
                clearInterval(pollInterval);
            }
        } catch (err) {
            setError('Failed to update status. Please try again.');
        }
    };

    if (loading) {
        return <div className={styles.loadingContainer}>Loading collaboration session...</div>;
    }

    if (error) {
        return (
            <div className={styles.errorContainer}>
                <h2>Error</h2>
                <p>{error}</p>
                <button onClick={() => navigate('/tickets')}>Return to Tickets</button>
            </div>
        );
    }

    if (!session) {
        return <div className={styles.errorContainer}>Session not found</div>;
    }

    return (
        <div className={styles.collaborationPortal}>
            <SessionHeader
                session={session}
                currentUser={currentUser}
                onStatusChange={handleStatusChange}
            />

            <MessageThread
                messages={messages}
                currentUser={currentUser}
                participants={session.participants}
            />

            <MessageInput
                onSendMessage={handleSendMessage}
                disabled={session.status === 'resolved'}
            />
        </div>
    );
};

export default CollaborationPortal;