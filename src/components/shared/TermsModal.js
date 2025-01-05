import styles from './TermsModal.module.css';

const TermsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <h2 className={styles.title}>Terms and Conditions</h2>
        <div className={styles.content}>
          <p>
            Welcome to RYZE.ai ("we," "us," "our"). By registering for and using our platform, you
            ("user," "you") agree to abide by these Terms of Agreement. Please
            read them carefully, as they define your rights, responsibilities,
            and the limitations of our liability.
          </p>

          <h3>1. Platform Neutrality</h3>
          <p>
            RYZE.ai serves as a neutral platform to connect individuals and
            businesses for the purpose of collaboration, communication, and
            service delivery. We are not responsible for enforcing agreements
            between parties or settling disputes. Any agreements or conflicts
            are solely the responsibility of the users involved.
          </p>

          <h3>2. Financial Transactions</h3>
          <p>
            All financial transactions and exchanges of funds between users are
            conducted outside of the RYZE.ai platform. RYZE.ai does not facilitate,
            process, or monitor payments between users. Users are fully responsible
            for ensuring timely payment and adherence to agreed terms.
          </p>

          <h3>3. User Responsibilities</h3>
          <ul>
            <li>
              You must provide accurate and truthful information in your
              profile, project postings, and communications.
            </li>
            <li>
              You are responsible for complying with all applicable laws and
              regulations in your jurisdiction.
            </li>
            <li>
              You agree to indemnify and hold RYZE.ai harmless from any claims,
              damages, or disputes arising from your use of the platform.
            </li>
          </ul>

          <h3>4. Limitations of Liability</h3>
          <p>
            RYZE.ai is not liable for user actions, disputes, or agreements.
            We are also not responsible for damages resulting from the use of
            the platform, interruptions in service, or errors.
          </p>

          <h3>5. Acceptance of Terms</h3>
          <p>
            By registering for and using the RYZE.ai platform, you acknowledge
            that you have read, understood, and agree to these Terms of
            Agreement. If you do not agree, you may not use the platform.
          </p>
        </div>
        <button onClick={onClose} className={styles.closeButton}>
          Close
        </button>
      </div>
    </div>
  );
};

export default TermsModal;
