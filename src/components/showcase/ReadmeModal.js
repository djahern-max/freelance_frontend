// ReadmeModal.js
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import api from '../../utils/api';
import styles from './ReadmeModal.module.css';

const ReadmeModal = ({ readmeUrl, onClose }) => {
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchReadme = async () => {
            try {
                const response = await api.get(readmeUrl);
                setContent(response.data);
            } catch (err) {
                setError('Failed to load README content');
                console.error('README fetch error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchReadme();
    }, [readmeUrl]);

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                <button className={styles.closeButton} onClick={onClose}>
                    <X size={24} />
                </button>
                <div className={styles.content}>
                    {loading && <div className={styles.loading}>Loading...</div>}
                    {error && <div className={styles.error}>{error}</div>}
                    {!loading && !error && (
                        <div className={styles.markdown}>
                            <ReactMarkdown>{content}</ReactMarkdown>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReadmeModal;