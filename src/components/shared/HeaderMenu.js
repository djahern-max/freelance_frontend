import { Menu } from 'lucide-react';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import styles from './HeaderMenu.module.css';

const HeaderMenu = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const menuContent = (
    <div
      className={`${styles.overlay} ${isOpen ? styles.overlayVisible : ''}`}
      onClick={() => setIsOpen(false)}
    >
      <div
        className={`${styles.menuPanel} ${
          isOpen ? styles.menuPanelVisible : ''
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.menuContent}>{children}</div>
      </div>
    </div>
  );

  return (
    <>
      <button className={styles.menuButton} onClick={() => setIsOpen(true)}>
        <Menu size={24} strokeWidth={1.5} />
      </button>
      {createPortal(menuContent, document.body)}
    </>
  );
};

export default HeaderMenu;
