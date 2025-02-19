import { useState } from 'react';
import styles from './DonationModal.module.css';
import { stripeService } from '../../utils/stripeService';

const DonationModal = ({ onClose }) => {
    const [amount, setAmount] = useState('5');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const presetAmounts = ['5', '10', '25', '50', '100'];

    const handleDonation = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await stripeService.createDonationSession({
                amount: Math.floor(parseFloat(amount) * 100), // Convert to cents
                currency: 'usd'
            });
            if (response.url) {
                window.location.href = response.url;
            }
        } catch (error) {
            setError('Failed to process donation. Please try again.');
            console.error('Donation error:', error);
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