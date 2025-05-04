import React, { useState } from 'react';
import styles from './Footer.module.css';
import ImageModal from './ImageModal';
import CodingBootcamp from '../../images/CodingBootcamp.png';
import CPALicense from '../../images/CPALicense.png';
import { Award, FileText } from 'lucide-react';

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
            <span className={styles.buttonText}>View Bootcamp Certificate</span>
          </button>
          <button
            onClick={() => openModal(CPALicense, 'CPA License')}
            className={`${styles.certificateButton} ${styles.cpaButton}`}
            title="View CPA License"
          >
            <FileText size={20} />
            <span className={styles.buttonText}>View CPA License</span>
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