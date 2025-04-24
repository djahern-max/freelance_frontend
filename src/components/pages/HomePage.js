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
      <div className={styles.noise}></div>

      <div className={styles.centeredContent}>
        <Logo className={styles.logo} width={220} />

        <h1 className={styles.title}>
          <span className={styles.highlight}>Connecting talent</span>
          <div className={styles.titleBottom}>
            <span className={styles.withText}>with</span>
            <span className={styles.opportunityText}>opportunity</span>
          </div>
        </h1>

        <p className={styles.subtitle}>A free platform built for freelance developers</p>

        <div className={styles.buttonGroup}>
          <button className={styles.login} onClick={() => navigate('/login')}>Login</button>
          <button className={styles.register} onClick={() => navigate('/register')}>Register</button>
        </div>

        <div className={styles.oauthDivider}>
          <div className={styles.dividerLine}></div>
          <span>or</span>
          <div className={styles.dividerLine}></div>
        </div>

        <div className={styles.oauthWrapper}>
          <OAuthButtons />
        </div>
      </div>

      <div className={styles.decorElements}>
        <div className={styles.slashOne}></div>
        <div className={styles.slashTwo}></div>
        <div className={styles.circle}></div>
        <div className={styles.dot}></div>
      </div>
    </div>
  );
}