import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import styles from './ShowcaseList.module.css';
import ShowcaseCard from './ShowcaseCard';

const ShowcaseList = () => {
    const [showcases, setShowcases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { developerId } = useParams();
    const currentUser = useSelector(state => state.auth.user);
    const navigate = useNavigate();

    useEffect(() => {
        fetchShowcases();
    }, [developerId]);

    const fetchShowcases = async () => {
        try {
            const response = await fetch(`/api/showcase/developer/${developerId}`);
            if (!response.ok) throw new Error('Failed to fetch showcases');
            const data = await response.json();
            setShowcases(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className={styles.loading}>Loading...</div>;
    }

    if (error) {
        return <div className={styles.error}>{error}</div>;
    }

    return (
        <div className={styles.container}>
            {currentUser?.id === parseInt(developerId) && (
                <button
                    onClick={() => navigate('/showcase/new')}
                    className={styles.addButton}
                >
                    Add New Showcase
                </button>
            )}

            <div className={styles.showcaseGrid}>
                {showcases.map(showcase => (
                    <ShowcaseCard key={showcase.id} showcase={showcase} />
                ))}
            </div>
        </div>
    );
};

export default ShowcaseList;