import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './HomePage.module.css';
import OAuthButtons from '../auth/OAuthButtons';

export default function HomePage() {
  const navigate = useNavigate();

  useEffect(() => {
    document.body.classList.add('no-scroll');
    document.documentElement.classList.add('no-scroll');

    return () => {
      document.body.classList.remove('no-scroll');
      document.documentElement.classList.remove('no-scroll');
    };
  }, []);

  return (
    <div className={styles.fullPage}>
      <div className={styles.centeredContent}>
        <div className={styles.logoContainer}>
          <h1 className={styles.name}>Dane J Ahern</h1>
          <div className={styles.titleDivider}></div>
          <h2 className={styles.title}>Full-Stack Developer & Solutions Architect</h2>
        </div>

        <p className={styles.subtitle}>What can I build for you?</p>

        <div className={styles.buttonGroup}>
          <button className={styles.login} onClick={() => navigate('/login')}>Login</button>
          <button className={styles.register} onClick={() => navigate('/register')}>Register</button>
        </div>

        <div className={styles.divider}>
          <span>or</span>
        </div>

        <div className={styles.oauthWrapper}>
          <OAuthButtons />
        </div>
      </div>
    </div>
  );
}