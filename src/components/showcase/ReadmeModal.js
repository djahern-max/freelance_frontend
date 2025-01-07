import React, { useEffect, useState } from 'react';
import { X, FileText } from 'lucide-react';
import { createPortal } from 'react-dom';
import api from '../../utils/api';
import styles from './ReadmeModal.module.css';

const ReadmeModal = ({ showcaseId, onClose }) => {
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchReadme = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/project-showcase/${showcaseId}/readme`, {
                    params: { format: 'html' }
                });
                setContent(response.data.content);
                setError(null);
            } catch (error) {
                console.error('Error fetching README:', error);
                setError('Failed to load README content');
            } finally {
                setLoading(false);
            }
        };

        fetchReadme();
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [showcaseId]);

    return createPortal(
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <div className={styles.header}>
                    <div className={styles.headerTitle}>
                        <FileText className={styles.headerIcon} />
                        <h2>README</h2>
                    </div>
                    <button onClick={onClose} className={styles.closeButton}>
                        <X size={20} />
                    </button>
                </div>
                <div className={styles.content}>
                    {loading ? (
                        <div className={styles.loadingContainer}>
                            <div className={styles.spinner} />
                        </div>
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
        </div>,
        document.body
    );
};

export default ReadmeModal;