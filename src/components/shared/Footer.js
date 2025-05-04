import React, { useState } from 'react';
import styles from './Footer.module.css';
import ImageModal from './ImageModal';
import CodingBootcamp from '../../images/CodingBootcamp.png';
import CodingBootcamp from '../../images/CodingBootcamp.png'; // Assuming second image has different name

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
            View Bootcamp Certificate
          </button>
          <button
            onClick={() => openModal(CodingBootcamp, 'Additional Certificate')}
            className={styles.imageLink}
          >
            View Additional Certificate
          </button>
        </div>

        <div className={styles.copyright}>
          © {new Date().getFullYear()} RYZE.ai. All rights reserved.
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