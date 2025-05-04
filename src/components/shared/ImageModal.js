import React, { useEffect } from 'react';
import styles from './ImageModal.module.css';

export default function ImageModal({ isOpen, onClose, imageSrc, alt }) {
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <button className={styles.closeButton} onClick={onClose}>×</button>
                <div className={styles.imageContainer}>
                    {imageSrc && (
                        <img
                            src={imageSrc}
                            alt={alt || 'Certificate image'}
                            className={styles.image}
                        />
                    )}
                </div>
                {alt && <p className={styles.caption}>{alt}</p>}
            </div>
        </div>
    );
}