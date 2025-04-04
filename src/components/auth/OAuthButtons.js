// src/components/auth/OAuthButtons.js
import React, { useEffect } from "react";
import apiService from '../../utils/apiService';
import styles from "./OAuthButtons.module.css";

const OAuthButtons = ({ className, buttonText = "Continue with" }) => {
    // Get OAuth URLs from the centralized service
    const googleLoginUrl = apiService.getGoogleOAuthUrl();
    const githubLoginUrl = apiService.getGithubOAuthUrl();
    const linkedinLoginUrl = apiService.getLinkedinOAuthUrl();

    // Log URLs for debugging in development mode
    useEffect(() => {
        if (process.env.NODE_ENV === 'development') {
            console.log("OAuth URLs:", {
                google: googleLoginUrl,
                github: githubLoginUrl,
                linkedin: linkedinLoginUrl
            });
        }
    }, [googleLoginUrl, githubLoginUrl, linkedinLoginUrl]);

    // Log when buttons are clicked
    const handleOAuthClick = (provider, url) => {
        if (process.env.NODE_ENV === 'development') {
            console.log(`${provider} login button clicked`);
            console.log("Navigating to:", url);
        }
        // We don't prevent default because we want the navigation to happen
    };

    return (
        <div className={`${styles.oauthContainer} ${className || ''}`}>
            {/* Google Login Button */}
            <a
                href={googleLoginUrl}
                className={`${styles.oauthButton} ${styles.googleButton}`}
                onClick={() => handleOAuthClick('Google', googleLoginUrl)}
            >
                <span className={styles.oauthIcon}>
                    <svg viewBox="0 0 24 24" width="18" height="18">
                        <path
                            d="M12.545 10.239v3.821h5.445c-0.712 2.315-2.647 3.972-5.445 3.972-3.332 0-6.033-2.701-6.033-6.032s2.701-6.032 6.033-6.032c1.498 0 2.866 0.549 3.921 1.453l2.814-2.814c-1.798-1.677-4.198-2.701-6.735-2.701-5.523 0-9.996 4.473-9.996 9.996s4.473 9.996 9.996 9.996c8.396 0 10.826-7.883 9.994-11.659h-9.994z"
                            fill="#4285F4"
                        />
                    </svg>
                </span>
                {buttonText} Google
            </a>

            {/* GitHub Login Button */}
            <a
                href={githubLoginUrl}
                className={`${styles.oauthButton} ${styles.githubButton}`}
                onClick={() => handleOAuthClick('GitHub', githubLoginUrl)}
            >
                <span className={styles.oauthIcon}>
                    <svg viewBox="0 0 24 24" width="18" height="18">
                        <path
                            d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
                            fill="#24292e"
                        />
                    </svg>
                </span>
                {buttonText} GitHub
            </a>

            {/* LinkedIn Login Button */}
            {/* <a
                href={linkedinLoginUrl}
                className={`${styles.oauthButton} ${styles.linkedinButton}`}
                onClick={() => handleOAuthClick('LinkedIn', linkedinLoginUrl)}
            >
                <span className={styles.oauthIcon}>
                    <svg viewBox="0 0 24 24" width="18" height="18">
                        <path
                            d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"
                            fill="#0077B5"
                        />
                    </svg>
                </span>
                {buttonText} LinkedIn
            </a> */}
        </div>
    );
};

export default OAuthButtons;