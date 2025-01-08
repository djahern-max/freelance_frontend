// src/components/showcase/ShowcaseList.js
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchShowcases, deleteShowcase } from '../../redux/showcaseSlice';
import ShowcaseRating from './ShowcaseRating';
import ReadmeModal from './ReadmeModal';
import styles from './ShowcaseList.module.css';

const ShowcaseList = () => {
  const dispatch = useDispatch();
  const { showcases, loading, error } = useSelector((state) => state.showcase);
  const { user } = useSelector((state) => state.auth);
  const [selectedReadme, setSelectedReadme] = useState(null);

  useEffect(() => {
    dispatch(fetchShowcases({ skip: 0, limit: 100 }));
  }, [dispatch]);

  const isOwner = (showcase) => {
    return user && showcase.developer_id === user.id;
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this showcase?')) {
      try {
        await dispatch(deleteShowcase(id)).unwrap();
      } catch (error) {
        console.error('Failed to delete showcase:', error);
      }
    }
  };

  const handleViewReadme = (showcase) => {
    setSelectedReadme(showcase);
  };

  if (loading) {
    return <div className={styles.loading}>Loading showcases...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  if (!showcases.length) {
    return (
      <div className={styles.emptyState}>
        <h2>No showcases yet</h2>
        <p>Create your first showcase to display your work!</p>
        {user && user.userType === 'developer' && (
          <Link to="/showcase/new" className={styles.createButton}>
            Create Showcase
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Project Showcases</h1>
        {user && user.userType === 'developer' && (
          <Link to="/showcase/new" className={styles.createButton}>
            Create New Showcase
          </Link>
        )}
      </div>

      <div className={styles.grid}>
        {showcases.map((showcase) => (
          <div key={showcase.id} className={styles.card}>
            <div className={styles.imageContainer}>
              <img
                src={showcase.image_url}
                alt={showcase.title}
                className={styles.image}
              />
            </div>

            <div className={styles.content}>
              <h3 className={styles.title}>{showcase.title}</h3>
              <p className={styles.description}>{showcase.description}</p>

              <div className={styles.links}>
                {showcase.project_url && (
                  <a
                    href={showcase.project_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.link}
                  >
                    Project Link
                  </a>
                )}
                {showcase.repository_url && (
                  <a
                    href={showcase.repository_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.link}
                  >
                    Repository
                  </a>
                )}
                {showcase.demo_url && (
                  <a
                    href={showcase.demo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.link}
                  >
                    Live Demo
                  </a>
                )}
              </div>

              <ShowcaseRating
                showcaseId={showcase.id}
                averageRating={showcase.average_rating}
                totalRatings={showcase.total_ratings}
              />

              <div className={styles.actions}>
                <button
                  onClick={() => handleViewReadme(showcase)}
                  className={styles.actionButton}
                >
                  View README
                </button>
                {isOwner(showcase) && (
                  <>
                    <Link
                      to={`/showcase/edit/${showcase.id}`}
                      className={styles.actionButton}
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(showcase.id)}
                      className={`${styles.actionButton} ${styles.deleteButton}`}
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedReadme && (
        <ReadmeModal
          showcase={selectedReadme}
          onClose={() => setSelectedReadme(null)}
        />
      )}
    </div>
  );
};

export default ShowcaseList;