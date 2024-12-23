// ListProductButton.js
import React, { useState } from 'react';
import { PlusCircle, X } from 'lucide-react';
import styles from './ListProductButton.module.css';
import CreateProductForm from './CreateProductForm';

const ListProductButton = () => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    return (
        <div className={styles.container}>
            <button
                onClick={() => setIsDialogOpen(true)}
                className={styles.listButton}
            >
                <PlusCircle className={styles.icon} />
                List a Product
            </button>

            {isDialogOpen && (
                <div className={styles.dialogOverlay} onClick={() => setIsDialogOpen(false)}>
                    <div
                        className={styles.dialogContent}
                        onClick={e => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setIsDialogOpen(false)}
                            className={styles.exitButton}
                        >
                            <X className={styles.exitIcon} />
                        </button>
                        <h2 className={styles.dialogTitle}>Create New Product</h2>
                        <CreateProductForm onSuccess={() => setIsDialogOpen(false)} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ListProductButton;