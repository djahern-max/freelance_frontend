import { MessageSquareMore, Heart, Coffee } from 'lucide-react';
import { useState, useEffect } from 'react'; // Added useEffect import
import FeedbackModal from '../feedback/FeedbackModal';
import DonationModal from '../payments/DonationModal';
import styles from './Footer.module.css';

const Footer = () => {
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [isHeartHovered, setIsHeartHovered] = useState(false);
  const [isFeedbackHovered, setIsFeedbackHovered] = useState(false);
  const [isCoffeeHovered, setIsCoffeeHovered] = useState(false);


  // useEffect(() => {

  //   const img = document.createElement('img');
  //   img.src = 'https://analytics-hub.org/api/tracking/pixel.gif?site_id=5&page=' + encodeURIComponent(window.location.pathname);
  //   img.style.position = 'absolute';
  //   img.style.width = '1px';
  //   img.style.height = '1px';
  //   img.style.top = '-1px';
  //   img.style.left = '-1px';
  //   document.body.appendChild(img);

  //   // Clean up function
  //   return () => {
  //     if (img.parentNode) {
  //       img.parentNode.removeChild(img);
  //     }
  //   };
  // }, []);

  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        {/* <div className={styles.section}>
          <button
            className={styles.donateButton}
            onClick={() => setShowDonationModal(true)}
            onMouseEnter={() => setIsHeartHovered(true)}
            onMouseLeave={() => setIsHeartHovered(false)}
            aria-label="Support Freelance.wtf"
          >
            <Heart
              size={18}
              className={styles.buttonIcon}
              fill="#ef4444"
              color={isHeartHovered ? '#ef4444' : '#ef4444'}
            />
            <span className={styles.buttonText}>Support Freelance.wtf</span>
          </button>
        </div> */}

        <div className={styles.section}>
          {/* <button
            className={styles.coffeeButton}
            onClick={() => setShowDonationModal(true)}
            onMouseEnter={() => setIsCoffeeHovered(true)}
            onMouseLeave={() => setIsCoffeeHovered(false)}
            aria-label="Help empower creators"
          >
            <div className={styles.supportText}>
              <Coffee
                size={16}
                className={styles.buttonIcon}
                color={isCoffeeHovered ? '#ef4444' : '#6b7280'}
              />
              <span>Help empower more creators</span>
            </div>
          </button> */}
        </div>

        <div className={`${styles.section} ${styles.rightSection}`}>
          <button
            className={styles.feedbackButton}
            onClick={() => setShowFeedbackModal(true)}
            onMouseEnter={() => setIsFeedbackHovered(true)}
            onMouseLeave={() => setIsFeedbackHovered(false)}
            aria-label="Provide feedback"
          >
            <MessageSquareMore
              size={18}
              className={styles.buttonIcon}
            />
            <span className={styles.buttonText}>Feedback</span>
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

      {/* {showDonationModal && (
        <DonationModal onClose={() => setShowDonationModal(false)} />
      )} */}
    </footer>
  );
};

export default Footer;