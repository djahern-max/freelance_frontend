// Message.js
// Individual message component
import React from 'react';
import styles from './Message.module.css';

export const Message = ({ message, isCurrentUser, participant }) => {
    const { content, created_at, message_type, is_system } = message;

    // Format the time
    const time = new Date(created_at).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
    });

    // Handle different message types
    if (is_system) {
        return (
            <div className={styles.systemMessage}>
                <div className={styles.systemContent}>{content}</div>
                <div className={styles.messageTime}>{time}</div>
            </div>
        );
    }

    // User messages
    const userType = participant?.user_type || 'unknown';
    const userName = participant?.user_name || 'Unknown User';

    // Determine CSS classes based on user type
    const messageClasses = [
        styles.message,
        isCurrentUser ? styles.outgoing : styles.incoming,
        styles[userType] // e.g. styles.ryze_developer or styles.analytics_hub_user
    ].join(' ');

    return (
        <div className={messageClasses}>
            <div className={styles.messageHeader}>
                <span className={styles.userName}>{userName}</span>
                <span className={styles.userType}>{userType.replace('_', ' ')}</span>
            </div>

            <div className={styles.messageContent}>
                {message_type === 'text' && <div className={styles.textContent}>{content}</div>}

                {message_type === 'link' && (
                    <div className={styles.linkContent}>
                        <a href={content} target="_blank" rel="noopener noreferrer">
                            {content}
                        </a>
                    </div>
                )}

                {message_type === 'file' && message.attachments && (
                    <div className={styles.fileContent}>
                        {message.attachments.map(attachment => (
                            <div key={attachment.id} className={styles.attachment}>
                                <a href={attachment.file_path} target="_blank" rel="noopener noreferrer">
                                    <span className={styles.fileName}>{attachment.file_name}</span>
                                    <span className={styles.fileSize}>
                                        {Math.round(attachment.file_size / 1024)}KB
                                    </span>
                                </a>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className={styles.messageTime}>{time}</div>
        </div>
    );
};