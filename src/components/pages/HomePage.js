import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './HomePage.module.css';
import Logo from '../shared/Logo';
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
        <Logo className={styles.logo} width={220} />

        <h1 className={styles.title}>
          <span className={styles.highlight}>Connecting talent</span>
          <span className={styles.withText}>with</span>
          <span className={styles.opportunityText}>opportunity</span>
        </h1>

        <p className={styles.subtitle}>A free platform built for freelance developers</p>

        <div className={styles.buttonGroup}>
          <button className={styles.login} onClick={() => navigate('/login')}>Login</button>
          <button className={styles.register} onClick={() => navigate('/register')}>Register</button>
        </div>

        <div className={styles.oauthDivider}>
          <span>or</span>
        </div>

        <div className={styles.oauthWrapper}>
          <OAuthButtons />
        </div>
      </div>

      <div className={styles.backgroundElements}>
        <div className={styles.circle1}></div>
        <div className={styles.circle2}></div>
        <div className={styles.squiggle1}></div>
        <div className={styles.squiggle2}></div>
      </div>
    </div>
  );
}