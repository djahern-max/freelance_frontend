

import React, { useEffect, useState, useRef } from 'react';
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
  const [hasMore, setHasMore] = useState(true);
  const [allShowcases, setAllShowcases] = useState([]);
  const [page, setPage] = useState(0);
  const ITEMS_PER_FETCH = 12;

  const observer = useRef();
  const lastShowcaseRef = useRef();

  useEffect(() => {
    if (loading) return;

    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });

    if (lastShowcaseRef.current) {
      observer.current.observe(lastShowcaseRef.current);
    }
  }, [loading, hasMore]);

  useEffect(() => {
    const fetchMore = async () => {
      try {
        const response = await dispatch(fetchShowcases({
          skip: page * ITEMS_PER_FETCH,
          limit: ITEMS_PER_FETCH
        })).unwrap();

        if (response.length < ITEMS_PER_FETCH) {
          setHasMore(false);
        }

        // Ensure no duplicates when adding new showcases
        setAllShowcases(prev => {
          const newShowcases = response.filter(
            newShowcase => !prev.some(
              existingShowcase => existingShowcase.id === newShowcase.id
            )
          );
          return [...prev, ...newShowcases];
        });
      } catch (error) {
        console.error('Failed to fetch showcases:', error);
        setHasMore(false);
      }
    };

    fetchMore();
  }, [page, dispatch]);

  const isOwner = (showcase) => {
    return user && showcase.developer_id === user.id;
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this showcase?')) {
      try {
        await dispatch(deleteShowcase(id)).unwrap();
        setAllShowcases(prev => prev.filter(showcase => showcase.id !== id));
      } catch (error) {
        console.error('Failed to delete showcase:', error);
      }
    }
  };

  const handleViewReadme = (showcase) => {
    setSelectedReadme(showcase);
  };

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  if (!allShowcases.length && !loading) {
    return (
      <div className={styles.emptyState}>
        <h2>No showcases yet</h2>
        {user && user.userType === 'developer' ? (
          <>
            <p>Create your first showcase to display your work!</p>
            <Link to="/showcase/new" className={styles.createButton}>
              Create Showcase
            </Link>
          </>
        ) : (
          <p>Check back later to see new showcases!</p>
        )}
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        {user && user.userType === 'developer' && (
          <Link to="/showcase/new" className={styles.createButton}>
            Create New Showcase
          </Link>
        )}
      </div>

      <div className={styles.grid}>
        {allShowcases.map((showcase, index) => {
          // Create a unique key combining showcase id and index
          const uniqueKey = `${showcase.id}-${index}`;

          return (
            <div
              key={uniqueKey}
              className={styles.card}
              ref={index === allShowcases.length - 1 ? lastShowcaseRef : null}
            >
              {/* Rest of your showcase card JSX */}
              <div className={styles.imageContainer}>
                <a
                  href={showcase.demo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.demoLink}
                >
                  <img
                    src={showcase.image_url}
                    alt={showcase.title}
                    className={styles.image}
                  />
                  <div className={styles.imageOverlay}>
                    <span className={styles.demoButton}>View Demo</span>
                  </div>
                </a>
              </div>
              <div className={styles.content}>
                <h3 className={styles.title}>{showcase.title}</h3>
                <p className={styles.description}>{showcase.description}</p>

                {showcase.developer_profile && (
                  <div className={styles.profileSection}>
                    <p className={styles.sectionHeading}>Creator</p>
                    <Link to={`/profile/developers/${showcase.developer_id}/public`} className={styles.profileLink}>
                      <img
                        src={showcase.developer_profile.profile_image_url}
                        alt="Developer"
                        className={styles.profileImage}
                      />
                      <span>{showcase.developer_profile.user.username}</span>
                    </Link>
                  </div>
                )}

                {showcase.videos?.length > 0 && (
                  <div className={styles.videoSection}>
                    <p className={styles.sectionHeading}>RELATED Videos</p>
                    <div className={`${styles.videoList} ${showcase.videos.length === 1 ? styles.single : ''}`}>
                      {showcase.videos.map(video => (
                        <Link
                          key={`${video.id}-${showcase.id}`}
                          to={`/video_display/stream/${video.id}`}
                          className={styles.videoItem}
                        >
                          <div className={styles.videoThumbnailWrapper}>
                            <img
                              src={video.thumbnail_path}
                              alt={video.title}
                              className={styles.videoThumbnail}
                            />
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
                <div className={styles.links}>
                  {showcase.project_url && (
                    <a
                      href={showcase.project_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.link}
                    >
                      Live Project!
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

                <div className={styles.ratingContainer}>
                  <ShowcaseRating
                    showcaseId={showcase.id}
                    averageRating={showcase.average_rating}
                    totalRatings={showcase.total_ratings}
                  />
                </div>

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
          );
        })}
      </div>

      {loading && <div className={styles.loading}>Loading more showcases...</div>}

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