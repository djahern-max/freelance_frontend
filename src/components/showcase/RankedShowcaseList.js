import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import styles from './RankedShowcaseList.module.css';
import ShowcaseRating from './ShowcaseRating';

const RankedShowcaseList = ({ limit = 10, title = "Top Projects" }) => {
    const [showcases, setShowcases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedIds, setExpandedIds] = useState([]);

    const toggleReadMore = (id) => {
        setExpandedIds((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    useEffect(() => {
        const fetchRankedShowcases = async () => {
            try {
                setLoading(true);

                // Use the full API URL with the appropriate prefix
                const response = await axios.get(`/api/project-showcase/ranked-projects/get?limit=${limit}`);

                // Check if response.data is an array before setting it
                if (Array.isArray(response.data)) {
                    setShowcases(response.data);
                } else {
                    console.error('API response is not an array:', response.data);
                    setShowcases([]);
                    setError('Received invalid data format from server.');
                }

                setLoading(false);
            } catch (err) {
                console.error('Error fetching ranked showcases:', err);
                setError('Failed to load top projects. Please try again later.');
                setShowcases([]);
                setLoading(false);
            }
        };

        fetchRankedShowcases();
    }, [limit]);

    if (loading) {
        return <div className={styles.loading}>Loading top projects...</div>;
    }

    if (error) {
        return <div className={styles.error}>{error}</div>;
    }

    if (!showcases || showcases.length === 0) {
        return <div className={styles.empty}>No projects available yet.</div>;
    }

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>{title}</h2>
            <div className={styles.showcaseList}>
                {Array.isArray(showcases) && showcases.map((showcase) => (
                    <div key={showcase.id} className={styles.showcaseCard}>
                        <Link to={`/showcase/${showcase.id}`} className={styles.showcaseLink}>
                            {showcase.image_url ? (
                                <img
                                    src={showcase.image_url}
                                    alt={showcase.title}
                                    className={styles.showcaseImage}
                                />
                            ) : (
                                <div className={styles.placeholderImage}></div>
                            )}
                        </Link>
                        <div className={styles.showcaseInfo}>
                            <Link to={`/showcase/${showcase.id}`} className={styles.showcaseLink}>
                                <h3 className={styles.showcaseTitle}>{showcase.title}</h3>
                            </Link>
                            <div className={styles.rating}>
                                <ShowcaseRating
                                    showcaseId={showcase.id}
                                    averageRating={showcase.average_rating}
                                    totalRatings={showcase.total_ratings}
                                    readOnly={true}
                                />
                            </div>
                            <p className={styles.showcaseDescription}>
                                {expandedIds.includes(showcase.id)
                                    ? showcase.description
                                    : showcase.description?.substring(0, 120) + (showcase.description?.length > 120 ? '...' : '')}
                                {showcase.description?.length > 120 && (
                                    <span
                                        className={styles.readMore}
                                        onClick={() => toggleReadMore(showcase.id)}
                                    >
                                        {expandedIds.includes(showcase.id) ? ' Show less' : ' Read more'}
                                    </span>
                                )}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default RankedShowcaseList;