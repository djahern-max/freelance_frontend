import { useState } from 'react';
import styles from './DonationModal.module.css';
import { stripeService } from '../../utils/stripeService';

const DonationModal = ({ onClose }) => {
    const [amount, setAmount] = useState('5');
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const presetAmounts = ['5', '10', '25', '50', '100'];

    const handleDonation = async () => {
        try {
            setLoading(true);
            setError('');

            const donationData = {
                amount: Math.floor(parseFloat(amount) * 100), // Convert to cents
                currency: 'usd',
                isAnonymous: isAnonymous
            };

            // Include auth token if not anonymous
            const headers = {
                'Content-Type': 'application/json'
            };

            if (!isAnonymous) {
                const token = localStorage.getItem('token');
                if (token) {
                    headers['Authorization'] = `Bearer ${token}`;
                }
            }

            console.log('Sending donation data:', donationData);

            const response = await stripeService.createDonationSession(donationData);

            if (response.url) {
                window.location.href = response.url;
            }
        } catch (error) {
            console.error('Donation error:', error);
            setError('Failed to process donation. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <h2>Support RYZE.ai</h2>
                <p>Choose an amount to donate</p>

                <div className={styles.presetAmounts}>
                    {presetAmounts.map((preset) => (
                        <button
                            key={preset}
                            className={`${styles.presetButton} ${amount === preset ? styles.selected : ''}`}
                            onClick={() => setAmount(preset)}
                        >
                            ${preset}
                        </button>
                    ))}
                </div>

                <div className={styles.customAmount}>
                    <label>Custom Amount</label>
                    <div className={styles.inputWrapper}>
                        <span>$</span>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            min="1"
                            step="1"
                        />
                    </div>
                </div>

                <div className={styles.anonymousOption}>
                    <label className={styles.checkboxLabel}>
                        <input
                            type="checkbox"
                            checked={isAnonymous}
                            onChange={(e) => setIsAnonymous(e.target.checked)}
                        />
                        Make this donation anonymous
                    </label>
                </div>

                {error && <div className={styles.error}>{error}</div>}

                <button
                    className={styles.donateButton}
                    onClick={handleDonation}
                    disabled={loading || !amount || parseFloat(amount) <= 0}
                >
                    {loading ? 'Processing...' : `Donate $${amount}`}
                </button>
            </div>
        </div>
    );
};

export default DonationModal;