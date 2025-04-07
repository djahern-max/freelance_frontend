// MessageThread.js
// Displays the chronological list of messages
import React, { useRef, useEffect } from 'react';
import { Message } from './Message';
import styles from './MessageThread.module.css';

export const MessageThread = ({ messages, currentUser, participants }) => {
    const messagesEndRef = useRef(null);

    // Auto-scroll to bottom when new messages are added
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    // Group messages by date for better visual separation
    const groupedMessages = messages.reduce((groups, message) => {
        const date = new Date(message.created_at).toLocaleDateString();
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(message);
        return groups;
    }, {});

    return (
        <div className={styles.messageThread}>
            {Object.entries(groupedMessages).map(([date, dateMessages]) => (
                <div key={date} className={styles.messageGroup}>
                    <div className={styles.dateHeader}>
                        <span>{date}</span>
                    </div>

                    {dateMessages.map(message => (
                        <Message
                            key={message.id}
                            message={message}
                            isCurrentUser={message.participant_id === currentUser?.id}
                            participant={participants.find(p => p.id === message.participant_id)}
                        />
                    ))}
                </div>
            ))}

            <div ref={messagesEndRef} />
        </div>
    );
};
