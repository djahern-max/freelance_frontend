import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGoogle, faGithub, faLinkedin } from '@fortawesome/free-brands-svg-icons';
import styles from './OAuthButtons.module.css';

const OAuthButtons = () => {
    const apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';

    const handleOAuthLogin = (provider) => {
        // Navigate to the OAuth provider's login page
        window.location.href = `${apiBaseUrl}/auth/${provider}`;
    };

    return (
        <div className={styles.oauthSection}>
            <div className={styles.dividerContainer}>
                <div className={styles.divider}></div>
                <span className={styles.dividerText}>OR</span>
                <div className={styles.divider}></div>
            </div>

            {/* Google OAuth Button */}
            <button
                className={`${styles.oauthButton} ${styles.google}`}
                onClick={() => handleOAuthLogin('google')}
                type="button"
                aria-label="Sign in with Google"
            >
                <FontAwesomeIcon icon={faGoogle} className={styles.oauthIcon} />
                Sign in with Google
            </button>

            {/* GitHub OAuth Button */}
            <button
                className={`${styles.oauthButton} ${styles.github}`}
                onClick={() => handleOAuthLogin('github')}
                type="button"
                aria-label="Sign in with GitHub"
            >
                <FontAwesomeIcon icon={faGithub} className={styles.oauthIcon} />
                Sign in with GitHub
            </button>

            {/* LinkedIn OAuth Button */}
            <button
                className={`${styles.oauthButton} ${styles.linkedin}`}
                onClick={() => handleOAuthLogin('linkedin')}
                type="button"
                aria-label="Sign in with LinkedIn"
            >
                <FontAwesomeIcon icon={faLinkedin} className={styles.oauthIcon} />
                Sign in with LinkedIn
            </button>
        </div>
    );
};

export default OAuthButtons;