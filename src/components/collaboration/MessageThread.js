// MessageThread.js - Update to show source system
import React, { useRef, useEffect } from 'react';
import { Message } from './Message';
import styles from './MessageThread.module.css';

export const MessageThread = ({ messages, currentUser, participants, sourceSystem }) => {
    const endRef = useRef(null);

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        if (endRef.current) {
            endRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    // Get participant information for a message
    const getParticipant = (userId) => {
        return participants.find(p => p.id === userId) || null;
    };

    // If this is an external ticket, add a source banner
    const isExternalTicket = sourceSystem && sourceSystem !== 'Freelance.wtf';

    return (
        <div className={styles.messageThread}>
            {isExternalTicket && (
                <div className={styles.sourceBanner}>
                    <div className={styles.sourceIcon}>
                        {sourceSystem === 'analytics-hub' ? '📊' : '🔄'}
                    </div>
                    <div className={styles.sourceInfo}>
                        <span className={styles.sourceLabel}>External Support Ticket</span>
                        <span className={styles.sourceName}>{sourceSystem}</span>
                    </div>
                </div>
            )}

            <div className={styles.messagesList}>
                {messages.map(message => (
                    <Message
                        key={message.id}
                        message={message}
                        isCurrentUser={currentUser && message.participant_id === currentUser.id}
                        participant={getParticipant(message.participant_id)}
                    />
                ))}
                <div ref={endRef} />
            </div>
        </div>
    );
};