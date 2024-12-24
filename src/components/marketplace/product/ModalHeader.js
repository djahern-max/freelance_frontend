// ModalHeader.js
import React from 'react';
import { X } from 'lucide-react';
import styles from './ModalHeader.module.css';

const ModalHeader = ({ title, onClose }) => {
    return (
        <div className={styles.headerContainer}>
            <h2 className={styles.title}>{title}</h2>
            <button
                onClick={onClose}
                className={styles.closeButton}
            >
                <X className={styles.closeIcon} />
            </button>
        </div>
    );
};

export default ModalHeader;