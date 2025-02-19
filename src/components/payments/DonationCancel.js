// components/payments/DonationCancel.js
import { useNavigate } from 'react-router-dom';
import styles from './DonationCancel.module.css';

const DonationCancel = () => {
    const navigate = useNavigate();

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.icon}>←</div>
                <h1 className={styles.title}>Donation Cancelled</h1>
                <p className={styles.message}>
                    Your donation has been cancelled. No charges have been made.
                </p>
                <button
                    className={styles.button}
                    onClick={() => navigate('/')}
                >
                    Return to Home
                </button>
            </div>
        </div>
    );
};

export default DonationCancel;