import React, { useState } from 'react';
import styles from './CollaborationLink.module.css';

const CollaborationLink = ({ collaboration, onRefresh }) => {
    const [isRefreshing, setIsRefreshing] = useState(false);

    if (!collaboration) return null;

    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            await onRefresh();
        } finally {
            setIsRefreshing(false);
        }
    };

    return (
        <div className={styles.collaborationContainer}>
            <div className={styles.collaborationHeader}>
                <h3>Connected to RYZE.ai Support</h3>
                <span className={styles.statusBadge} data-status={collaboration.status}>
                    {collaboration.status}
                </span>
            </div>

            <p className={styles.collaborationDescription}>
                Your support ticket has been connected to RYZE.ai's technical support system.
                Messages from support specialists will appear below.
            </p>

            <div className={styles.collaborationActions}>
                <a
                    href={collaboration.collaboration_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.viewButton}
                >
                    View in RYZE.ai
                </a>

                <button
                    className={styles.refreshButton}
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                >
                    {isRefreshing ? 'Refreshing...' : 'Refresh Messages'}
                </button>
            </div>
        </div>
    );
};

export default CollaborationLink;
