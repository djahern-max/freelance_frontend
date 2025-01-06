import React, { useState } from 'react';
import StarRating from '../shared/StarRating';
import styles from './ShowcaseCard.module.css';

const ShowcaseCard = ({ showcase }) => {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className={styles.card}>
            <h3 className={styles.title}>{showcase.title}</h3>
            <div className={styles.description}>
                {expanded
                    ? showcase.description
                    : showcase.description.slice(0, 150) + (showcase.description.length > 150 ? '...' : '')}
            </div>

            {showcase.description.length > 150 && (
                <button
                    onClick={() => setExpanded(!expanded)}
                    className={styles.toggleButton}
                >
                    {expanded ? 'Show less' : 'Read more'}
                </button>
            )}

            <div className={styles.details}>
                <div className={styles.ratingContainer}>
                    <StarRating rating={4.5} />
                </div>

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