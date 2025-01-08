// src/components/showcase/EditShowcaseForm.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchShowcase } from '../../redux/showcaseSlice';
import ShowcaseForm from './ShowcaseForm';
import styles from './EditShowcaseForm.module.css';

const EditShowcaseForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { currentShowcase, loading, error } = useSelector((state) => state.showcase);
    const { user } = useSelector((state) => state.auth);
    const [loadingInitial, setLoadingInitial] = useState(true);

    useEffect(() => {
        const loadShowcase = async () => {
            try {
                const result = await dispatch(fetchShowcase(id)).unwrap();
                setLoadingInitial(false);

                // Check if the current user is the owner
                if (!user || result.developer_id !== user.id) {
                    navigate('/showcase', {
                        replace: true,
                        state: { error: 'You do not have permission to edit this showcase' }
                    });
                }
            } catch (err) {
                console.error('Error loading showcase:', err);
                navigate('/showcase', {
                    replace: true,
                    state: { error: 'Failed to load showcase for editing' }
                });
            }
        };

        loadShowcase();
    }, [dispatch, id, navigate, user]);

    if (loadingInitial || loading) {
        return (
            <div className={styles.loading}>
                <div className={styles.spinner}></div>
                Loading showcase...
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.error}>
                <h2>Error Loading Showcase</h2>
                <p>{error}</p>
                <button
                    onClick={() => navigate('/showcase')}
                    className={styles.backButton}
                >
                    Back to Showcases
                </button>
            </div>
        );
    }

    if (!currentShowcase) {
        return (
            <div className={styles.notFound}>
                <h2>Showcase Not Found</h2>
                <p>The showcase you're trying to edit doesn't exist or has been removed.</p>
                <button
                    onClick={() => navigate('/showcase')}
                    className={styles.backButton}
                >
                    Back to Showcases
                </button>
            </div>
        );
    }

    return (
        <div className={styles.wrapper}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h1>Edit Showcase</h1>
                    <button
                        onClick={() => navigate('/showcase')}
                        className={styles.cancelButton}
                    >
                        Cancel
                    </button>
                </div>

                <ShowcaseForm
                    showcase={currentShowcase}
                    isEditing={true}
                />
            </div>
        </div>
    );
};

export default EditShowcaseForm;