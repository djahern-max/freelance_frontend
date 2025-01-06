import React, { useState } from 'react';
import StarRating from '../shared/StarRating';
import styles from './ShowcaseCard.module.css';

const ShowcaseCard = ({ showcase }) => {
    const [expanded, setExpanded] = useState(false);

    const handleToggleExpand = () => {
        setExpanded(!expanded);
    };

    return (
        <div className={styles.card}>
            {showcase.image_url && (
                <div className={styles.imageContainer}>
                    <img src={showcase.image_url} alt={showcase.title} />
                </div>
            )}

            <h3 className={styles.title}>{showcase.title}</h3>
            <div className={styles.description}>
                {expanded
                    ? showcase.description
                    : showcase.description.slice(0, 150) + (showcase.description.length > 150 ? '...' : '')}
            </div>

            {showcase.description.length > 150 && (
                <button
                    onClick={handleToggleExpand}
                    className={styles.toggleButton}
                >
                    {expanded ? 'Show less' : 'Read more'}
                </button>
            )}

            <div className={styles.details}>
                <div className={styles.ratingContainer}>
                    <StarRating rating={4.5} />
                </div>

                {showcase.project_url && (
                    <a
                        href={showcase.project_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.link}
                    >
                        View Project
                    </a>
                )}

                {showcase.repository_url && (
                    <a
                        href={showcase.repository_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.link}
                    >
                        View Code
                    </a>
                )}

                {showcase.demo_url && (
                    <a
                        href={showcase.demo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.link}
                    >
                        View Demo
                    </a>
                )}

                {showcase.readme_url && (
                    <a
                        href={showcase.readme_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.link}
                    >
                        View README
                    </a>
                )}

                {showcase.video_ids?.length > 0 && (
                    <div className={styles.videoSection}>
                        <h4>Related Videos</h4>
                        {/* Video thumbnails implementation */}
                    </div>
                )}

                {showcase.readme && (
                    <div className={styles.readmeSection}>
                        <h4>README</h4>
                        <pre className={styles.readmeContent}>
                            {showcase.readme}
                        </pre>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ShowcaseCard;