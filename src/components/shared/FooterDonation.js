import React, { useState } from 'react';
import { Heart, Coffee, Star, Sparkles } from 'lucide-react';
import DonationModal from '../payments/DonationModal';
import styles from './FooterDonation.module.css';

const FooterDonation = () => {
    const [showModal, setShowModal] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <div className={styles.leftSection}>
                    <div className={styles.iconWrapper}>
                        <Heart
                            className={`${styles.heartIcon} ${isHovered ? styles.heartIconHovered : ''}`}
                            fill={isHovered ? '#ef4444' : 'none'}
                            onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={() => setIsHovered(false)}
                        />
                        {isHovered && (
                            <Sparkles className={styles.sparklesIcon} />
                        )}
                    </div>
                    <div className={styles.textContainer}>
                        <h3 className={styles.title}>Support Innovation</h3>
                        <p className={styles.subtitle}>Help us empower more creators</p>
                    </div>
                </div>

                <div className={styles.rightSection}>
                    <div className={styles.supportText}>
                        <Coffee className={styles.coffeeIcon} />
                        <span>Join our supporters</span>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className={styles.donateButton}
                    >
                        <Star className={styles.starIcon} />
                        <span>Donate Now</span>
                    </button>
                </div>
            </div>

            {showModal && <DonationModal onClose={() => setShowModal(false)} />}
        </div>
    );
};

export default FooterDonation;