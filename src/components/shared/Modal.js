import React from 'react';
import ReactDOM from 'react-dom';
import styles from './Modal.module.css';

const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return ReactDOM.createPortal(
        <div className={styles.modalOverlay} onClick={onClose}>
            <div
                className={styles.modalContent}
                onClick={(e) => e.stopPropagation()}
            >
                <h3 className={styles.modalTitle}>{title}</h3>
                <div className={styles.modalBody}>{children}</div>
                <button
                    onClick={onClose}
                    className={styles.closeButton}
                >
                    Close
                </button>
            </div>
        </div>,
        document.body
    );
};

export default Modal;
