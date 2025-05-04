import React, { useState } from 'react';
import styles from './Footer.module.css';
import ImageModal from './ImageModal';
import CodingBootcamp from '../../images/CodingBootcamp.png';
import CPALicense from '../../images/CPALicense.png';

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
        <div className={styles.links}>
          <button
            onClick={() => openModal(CodingBootcamp, 'Coding Bootcamp Certificate')}
            className={styles.imageLink}
          >
            Coding Bootcamp Certificate
          </button>
          <button
            onClick={() => openModal(CPALicense, 'CPA License')}
            className={styles.imageLink}
          >
            CPA License
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