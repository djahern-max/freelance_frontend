import { Heart, MessageSquareMore } from 'lucide-react';
import { useState } from 'react';
import FeedbackModal from '../feedback/FeedbackModal';
import styles from './Footer.module.css';

const Footer = () => {
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  // const footerLinks = [
  //   { text: 'About', href: '/about' },
  //   { text: 'Terms', href: '/terms' },
  //   { text: 'Privacy', href: '/privacy' },
  //   { text: 'Contact', href: '/contact' },
  // ];

  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.leftSection}>
          <span className={styles.copyright}>
            © {new Date().getFullYear()} RYZE.ai
          </span>
        </div>

        {/* <nav className={styles.middleSection}>
          {footerLinks.map((link, index) => (
            <a key={index} href={link.href} className={styles.footerLink}>
              {link.text}
            </a>
          ))}
        </nav> */}

        <div className={styles.rightSection}>
          <button
            className={styles.iconButton}
            onClick={() => setShowFeedbackModal(true)}
            title="Send Feedback"
          >
            <MessageSquareMore size={18} />
          </button>
          <button
            className={styles.iconButton}
            onClick={() => window.open('/support', '_blank')}
            title="Support RYZE.ai"
          >
            <Heart size={18} />
          </button>
        </div>
      </div>

      {showFeedbackModal && (
        <FeedbackModal
          location="footer"
          targetId="general_feedback"
          onClose={() => setShowFeedbackModal(false)}
        />
      )}
    </footer>
  );
};

export default Footer;
