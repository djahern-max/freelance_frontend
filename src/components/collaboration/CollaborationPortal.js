import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    fetchSessionData,
    fetchMessages,
    sendMessage,
    updateSessionStatus
} from '../../utils/collaborationService';
import styles from './CollaborationPortal.module.css';

// First, let's create an improved version of CollaborationPortal.js
const CollaborationPortal = () => {
    const { sessionId, accessToken } = useParams();
    const navigate = useNavigate();
    const [session, setSession] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [pollInterval, setPollInterval] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);

    // Load session data initially
    useEffect(() => {
        const loadSessionData = async () => {
            try {
                setLoading(true);

                // Try to fetch the session with the provided token
                const sessionData = await fetchSessionData(sessionId, accessToken);
                setSession(sessionData);

                // Find current user in participants
                const user = sessionData.participants.find(p => p.is_current_user);
                if (!user) {
                    throw new Error('User not found in session participants');
                }
                setCurrentUser(user);

                // Load initial messages
                const messageData = await fetchMessages(sessionId, accessToken);
                setMessages(messageData);

                setLoading(false);
            } catch (err) {
                console.error('Session loading error:', err);
                setError('Failed to load collaboration session. The link may be invalid or expired.');
                setLoading(false);
            }
        };

        loadSessionData();
    }, [sessionId, accessToken]);

    // Set up polling for new messages and scroll to bottom when messages change
    useEffect(() => {
        const scrollToBottom = () => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        };

        scrollToBottom();

        if (session && session.status !== 'resolved') {
            const interval = setInterval(async () => {
                try {
                    // Only fetch messages newer than the last one we have
                    const lastMessageId = messages.length > 0 ?
                        messages[messages.length - 1].id : 0;

                    const messageData = await fetchMessages(
                        sessionId,
                        accessToken,
                        lastMessageId
                    );

                    if (messageData.length > 0) {
                        setMessages(prev => [...prev, ...messageData]);
                        // Scroll to bottom on new messages
                        setTimeout(scrollToBottom, 100);
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
    const handleSendMessage = async (e) => {
        e.preventDefault();

        if (!newMessage.trim()) return;

        try {
            setSending(true);

            const sentMessage = await sendMessage(sessionId, accessToken, {
                content: newMessage,
                message_type: 'text'
            });

            // Add the new message to the list
            setMessages(prev => [...prev, sentMessage]);

            // Clear the input
            setNewMessage('');

            // Scroll to the new message
            setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        } catch (err) {
            setError('Failed to send message. Please try again.');
            console.error('Error sending message:', err);
        } finally {
            setSending(false);
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
            console.error('Status update error:', err);
        }
    };

    // Display loading state
    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.loadingSpinner}></div>
                <div>Loading collaboration session...</div>
            </div>
        );
    }

    // Display error state
    if (error) {
        return (
            <div className={styles.errorContainer}>
                <h2>Error</h2>
                <p>{error}</p>
                <button
                    onClick={() => navigate('/tickets')}
                    className={styles.returnButton}
                >
                    Return to Tickets
                </button>
            </div>
        );
    }

    // Display session not found state
    if (!session) {
        return (
            <div className={styles.errorContainer}>
                <h2>Session Not Found</h2>
                <p>The collaboration session could not be found or has expired.</p>
                <button
                    onClick={() => navigate('/tickets')}
                    className={styles.returnButton}
                >
                    Return to Tickets
                </button>
            </div>
        );
    }

    return (
        <div className={styles.collaborationPortal}>
            {/* Session Header */}
            <div className={styles.sessionHeader}>
                <div className={styles.sessionInfo}>
                    <h1 className={styles.sessionTitle}>
                        Support Session #{session.external_ticket_id}
                    </h1>
                    <div className={styles.sessionMeta}>
                        <span className={styles.sourceSystem}>
                            Source: {session.source_system}
                        </span>
                        <span className={styles.statusLabel}>
                            Status:
                            <span className={`${styles.statusBadge} ${styles[session.status]}`}>
                                {session.status.replace('_', ' ')}
                            </span>
                        </span>
                    </div>
                </div>

                {/* Status Control - Only for RYZE developers */}
                {currentUser && currentUser.user_type === 'ryze_developer' && (
                    <div className={styles.statusControl}>
                        <select
                            value={session.status}
                            onChange={(e) => handleStatusChange(e.target.value)}
                            disabled={session.status === 'resolved'}
                            className={styles.statusSelect}
                        >
                            <option value="open">Open</option>
                            <option value="in_progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                        </select>
                    </div>
                )}
            </div>

            {/* Messages Thread */}
            <div className={styles.messagesThread}>
                {messages.length === 0 ? (
                    <div className={styles.noMessages}>
                        No messages yet. Start the conversation by sending a message.
                    </div>
                ) : (
                    messages.map(message => {
                        // Get participant info
                        const participant = message.participant_id ?
                            session.participants.find(p => p.id === message.participant_id) : null;

                        // Determine if message is from current user
                        const isCurrentUser = currentUser &&
                            message.participant_id === currentUser.id;

                        // Generate appropriate CSS classes
                        const messageClasses = [
                            styles.message,
                            isCurrentUser ? styles.outgoing : styles.incoming,
                            message.is_system ? styles.systemMessage : '',
                            participant?.user_type ? styles[participant.user_type] : ''
                        ].filter(Boolean).join(' ');

                        // Format timestamp
                        const time = new Date(message.created_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                        });

                        return (
                            <div key={message.id} className={messageClasses}>
                                {!message.is_system && (
                                    <div className={styles.messageHeader}>
                                        <span className={styles.userName}>
                                            {participant?.user_name || 'Unknown User'}
                                        </span>
                                        <span className={styles.userType}>
                                            {participant?.user_type?.replace('_', ' ') || ''}
                                        </span>
                                    </div>
                                )}

                                <div className={styles.messageContent}>
                                    {message.content}
                                </div>

                                <div className={styles.messageTime}>
                                    {time}
                                </div>

                                {/* Display file attachments if any */}
                                {message.attachments && message.attachments.length > 0 && (
                                    <div className={styles.attachments}>
                                        {message.attachments.map(attachment => (
                                            <div key={attachment.id} className={styles.attachment}>
                                                <a
                                                    href={attachment.file_path}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={styles.attachmentLink}
                                                >
                                                    <span className={styles.attachmentName}>
                                                        {attachment.file_name}
                                                    </span>
                                                    <span className={styles.attachmentSize}>
                                                        {formatFileSize(attachment.file_size)}
                                                    </span>
                                                </a>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Message Input Form */}
            <form className={styles.messageForm} onSubmit={handleSendMessage}>
                <textarea
                    className={styles.messageInput}
                    placeholder={session.status === 'resolved'
                        ? "This session has been resolved"
                        : "Type your message here..."}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    disabled={session.status === 'resolved' || sending}
                    rows={3}
                />

                <div className={styles.messageActions}>
                    <button
                        type="submit"
                        className={styles.sendButton}
                        disabled={session.status === 'resolved' ||
                            sending ||
                            !newMessage.trim()}
                    >
                        {sending ? 'Sending...' : 'Send Message'}
                    </button>
                </div>
            </form>
        </div>
    );
};

// Helper function to format file sizes
const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
};

export default CollaborationPortal;