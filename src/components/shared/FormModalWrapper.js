// components/shared/FormModalWrapper.js
import React from 'react';
import Modal from './Modal';
import styles from './FormModalWrapper.module.css';

/**
 * A specialized modal wrapper for forms that ensures proper styling
 * This component adds padding to the form content inside a modal
 */
const FormModalWrapper = ({ isOpen, onClose, title, children }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <div className={styles.formContainer}>
                {children}
            </div>
        </Modal>
    );
};

export default FormModalWrapper;