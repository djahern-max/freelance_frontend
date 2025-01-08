// src/components/showcase/ReadmeModal.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './ReadmeModal.module.css';

const ReadmeModal = ({ showcase, onClose }) => {
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchReadme = async () => {
            try {
                const response = await axios.get(
                    `${process.env.REACT_APP_API_URL}/project-showcase/${showcase.id}/readme?format=html`,
                    {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        }
                    }
                );
                setContent(response.data.content);
                setLoading(false);
            } catch (err) {
                setError('Failed to load README content');
                setLoading(false);
                console.error('Error fetching README:', err);
            }
        };

        fetchReadme();
    }, [showcase.id]);

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div className={styles.overlay} onClick={handleOverlayClick}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <h2>{showcase.title} - README</h2>
                    <button className={styles.closeButton} onClick={onClose}>
                        ×
                    </button>
                </div>

                <div className={styles.content}>
                    {loading ? (
                        <div className={styles.loading}>Loading README...</div>
                    ) : error ? (
                        <div className={styles.error}>{error}</div>
                    ) : (
                        <div
                            className={styles.markdown}
                            dangerouslySetInnerHTML={{ __html: content }}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReadmeModal;