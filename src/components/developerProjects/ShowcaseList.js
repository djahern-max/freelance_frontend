import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import styles from './ShowcaseList.module.css';
import ShowcaseCard from './ShowcaseCard';

const ShowcaseList = () => {
    const [showcases, setShowcases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { developerId } = useParams();
    const currentUser = useSelector(state => state.auth.user);
    const navigate = useNavigate();

    const targetDeveloperId = developerId || (currentUser?.id?.toString());

    useEffect(() => {
        if (targetDeveloperId) {
            fetchShowcases();
        }
    }, [targetDeveloperId]);

    const fetchShowcases = async () => {
        if (!targetDeveloperId) {
            setError("No developer ID available");
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            console.log('Fetching showcases for developer:', targetDeveloperId);
            const response = await api.get(`/project-showcase/developer/${targetDeveloperId}`);
            console.log('Fetched showcases:', response);

            // Ensure we're setting an array, even if empty
            setShowcases(Array.isArray(response.data) ? response.data : []);

        } catch (err) {
            console.error('Error fetching showcases:', err);
            const errorMessage = err?.response?.data?.detail || err.message || 'Failed to fetch showcases';
            setError(errorMessage);
            toast.error(errorMessage);
            setShowcases([]); // Set empty array on error
        } finally {
            setLoading(false);
        }
    };

    const handleAddNew = () => {
        navigate('/showcase/new');
    };

    const isOwnProfile = currentUser?.id === parseInt(targetDeveloperId);

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.loading}>Loading showcases...</div>
            </div>
        );
    }

    return (
        <div className={styles.container}>


            {error ? (
                <div className={styles.errorContainer}>
                    <div className={styles.error}>
                        <p>{error}</p>
                        <button
                            onClick={fetchShowcases}
                            className={styles.retryButton}
                        >
                            Retry
                        </button>
                    </div>
                </div>
            ) : showcases.length === 0 ? (
                <div className={styles.emptyState}>
                    <h3>No showcases found</h3>
                    {isOwnProfile && (
                        <p>Create your first project showcase to display your work!</p>
                    )}
                </div>
            ) : (
                <div className={styles.showcaseGrid}>
                    {showcases.map(showcase => (
                        <ShowcaseCard
                            key={showcase.id}
                            showcase={showcase}
                            onUpdate={fetchShowcases}
                            isOwner={isOwnProfile}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default ShowcaseList;