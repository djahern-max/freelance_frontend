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
          >
            <Award className={styles.iconMobile} size={20} />
            <span className={styles.desktopText}>View Bootcamp Certificate</span>
          </button>
          <button
            onClick={() => openModal(CPALicense, 'CPA License')}
            className={`${styles.certificateButton} ${styles.cpaButton}`}
          >
            <FileText className={styles.iconMobile} size={20} />
            <span className={styles.desktopText}>View CPA License</span>
          </button>
        </div>

        {/* Removed copyright/all rights reserved */}
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