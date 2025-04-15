// src/components/videos/DescriptionModal.js
import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { X } from 'lucide-react';
import styles from './DescriptionModal.module.css';

const DescriptionModal = ({ isOpen, onClose, title, description }) => {
    const modalRef = useRef(null);

    // Handle click outside to close
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                onClose();
            }
        };

        // Prevent body scrolling when modal is open
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.body.style.overflow = '';
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    // Handle escape key to close modal
    useEffect(() => {
        const handleEsc = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            window.addEventListener('keydown', handleEsc);
        }

        return () => {
            window.removeEventListener('keydown', handleEsc);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return ReactDOM.createPortal(
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent} ref={modalRef}>
                <button className={styles.closeButton} onClick={onClose}>
                    <X size={20} />
                </button>

                {/* Video content section */}
                <div className={styles.contentContainer}>
                    <h3 className={styles.modalTitle}>{title}</h3>
                    <div className={styles.modalDescription}>
                        {description}
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default DescriptionModal;