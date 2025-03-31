import React from 'react';
import ReactDOM from 'react-dom';
import styles from './Modal.module.css';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div
                className={styles.modalContent}
                onClick={(e) => e.stopPropagation()}
            >
                <div className={styles.modalHeader}>
                    <h3 className={styles.modalTitle}>{title}</h3>
                    <button className={styles.closeButton} onClick={onClose}>
                        <X size={18} />
                    </button>
                </div>
                {/* Remove any padding from this container */}
                <div className={styles.modalBody}>
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;
