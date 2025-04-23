// SessionHeader.js
// Displays ticket information and controls for the session
import React from 'react';
import styles from './SessionHeader.module.css';

export const SessionHeader = ({ session, currentUser, onStatusChange }) => {
    const isFreelanceUser = currentUser?.user_type === 'Freelance.wtf_developer';


    const canChangeStatus = isFreelanceUser;

    const statusOptions = [
        { value: 'open', label: 'Open' },
        { value: 'in_progress', label: 'In Progress' },
        { value: 'resolved', label: 'Resolved' }
    ];

    return (
        <div className={styles.sessionHeader}>
            <div className={styles.ticketInfo}>
                <h1>Support Collaboration: #{session.external_ticket_id}</h1>
                <div className={styles.sourceSystem}>
                    <span className={styles.sourceLabel}>From:</span>
                    <span className={styles.sourceValue}>{session.source_system}</span>
                </div>
            </div>

            <div className={styles.statusSection}>
                <div className={styles.currentStatus}>
                    <span className={styles.statusLabel}>Status:</span>
                    <span className={`${styles.statusValue} ${styles[session.status]}`}>
                        {session.status.replace('_', ' ')}
                    </span>
                </div>

                {canChangeStatus && (
                    <div className={styles.statusControl}>
                        <select
                            value={session.status}
                            onChange={(e) => onStatusChange(e.target.value)}
                            disabled={session.status === 'resolved'} // Can't change from resolved
                            className={styles.statusSelect}
                        >
                            {statusOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>
        </div>
    );
};