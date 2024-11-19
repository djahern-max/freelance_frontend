// HomeHeader.js
import React from 'react';
import styles from './HomeHeader.module.css';

const HomeHeader = () => {
  return (
    <header className={styles.homeHeader}>
      <div className={styles.headerContent}>
        <h1 className={styles.homeHeaderTitle}>RYZE.ai</h1>
      </div>
    </header>
  );
};

export default HomeHeader;
