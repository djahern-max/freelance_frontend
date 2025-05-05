import React, { useState } from 'react';
import styles from './Footer.module.css';
import ImageModal from './ImageModal';
import CodingBootcamp from '../../images/CodingBootcamp.png';
import CPALicense from '../../images/CPALicense.png';
import { Award, FileText, Calendar, ChevronRight } from 'lucide-react';

export default function Footer() {
  const [modalImage, setModalImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = (imageSrc, alt) => {
    setModalImage({ src: imageSrc, alt });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalImage(null);
  };

  // Placeholder function for Cal.com integration
  const handleBookingClick = () => {
    // This will be replaced with Cal.com integration
    console.log('Booking button clicked - Cal.com integration coming soon');
    // For now, you could show an alert, open a modal, redirect to a contact form, etc.
    alert('Cal.com integration coming soon! For now, please contact me at [your email]');
  };

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.certificateLinks}>
          <button
            onClick={() => openModal(CodingBootcamp, 'Coding Bootcamp Certificate')}
            className={`${styles.certificateButton} ${styles.bootcampButton}`}
            title="View Bootcamp Certificate"
          >
            <Award size={20} />
            <span className={styles.buttonText}>Coding Bootcamp</span>
          </button>

          <ChevronRight className={styles.arrow} size={20} />

          <button
            onClick={() => openModal(CPALicense, 'CPA License')}
            className={`${styles.certificateButton} ${styles.cpaButton}`}
            title="View CPA License"
          >
            <FileText size={20} />
            <span className={styles.buttonText}>CPA License</span>
          </button>

          <ChevronRight className={styles.arrow} size={20} />

          <button
            onClick={handleBookingClick}
            className={`${styles.certificateButton} ${styles.bookingButton}`}
            title="Schedule a call with me"
          >
            <Calendar size={20} />
            <span className={styles.buttonText}>Book a Call!</span>
          </button>
        </div>
      </div>

      <ImageModal
        isOpen={isModalOpen}
        onClose={closeModal}
        imageSrc={modalImage?.src}
        alt={modalImage?.alt}
      />
    </footer>
  );
}