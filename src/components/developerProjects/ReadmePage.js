// ReadmePage.js
import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import api from '../../utils/api';
import styles from './ReadmePage.module.css';

const ReadmePage = ({ showcase, onClose }) => {
    const [readmeContent, setReadmeContent] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReadme = async () => {
            try {
                const response = await api.get(`/project-showcase/${showcase.id}/readme`);
                if (response.data?.content) {
                    setReadmeContent(response.data.content);
                }
            } catch (err) {
                console.error('Error fetching README:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchReadme();
    }, [showcase.id]);

    return (
        <div className={styles.readmePage}>
            <header className={styles.header}>
                <h1 className={styles.title}>README - {showcase.title}</h1>
                <button
                    onClick={onClose}
                    className={styles.closeButton}
                    aria-label="Close README"
                >
                    <X size={24} />
                </button>
            </header>

            <main className={styles.content}>
                {loading ? (
                    <div className={styles.loading}>Loading...</div>
                ) : (
                    <div className={styles.markdownContainer}>
                        <ReactMarkdown>
                            {readmeContent}
                        </ReactMarkdown>
                    </div>
                )}
            </main>
        </div>
    );
};

export default ReadmePage;