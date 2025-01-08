// LinkedContent.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, User } from 'lucide-react';
import styles from './LinkedContent.module.css';

const LinkedContent = ({ linkedContent = [] }) => {
    const navigate = useNavigate();

    if (!linkedContent?.length) return null;

    return (
        <div className={styles.linkedContentSection}>
            <h3 className={styles.sectionTitle}>Linked Content</h3>
            <div className={styles.contentGrid}>
                {linkedContent.map((content) => (
                    <div
                        key={content.id}
                        className={styles.contentCard}
                        onClick={() => {
                            if (content.type === 'video') {
                                navigate(`/video_display/stream/${content.content_id}`);
                            } else if (content.type === 'profile') {
                                navigate(`/profile/developers/${content.content_id}/public`);
                            }
                        }}
                    >
                        {content.type === 'video' ? (
                            <>
                                {content.thumbnail_url ? (
                                    <div className={styles.thumbnailContainer}>
                                        <img
                                            src={content.thumbnail_url}
                                            alt={content.title}
                                            className={styles.thumbnail}
                                        />
                                        <div className={styles.overlay}>
                                            <Video size={24} />
                                        </div>
                                    </div>
                                ) : (
                                    <div className={styles.placeholderThumbnail}>
                                        <Video size={32} />
                                    </div>
                                )}
                                <p className={styles.title}>{content.title}</p>
                            </>
                        ) : (
                            <>
                                {content.profile_image_url ? (
                                    <div className={styles.profileImageContainer}>
                                        <img
                                            src={content.profile_image_url}
                                            alt="Developer profile"
                                            className={styles.profileImage}
                                        />
                                    </div>
                                ) : (
                                    <div className={styles.placeholderProfile}>
                                        <User size={32} />
                                    </div>
                                )}
                                <p className={styles.title}>{content.developer_name}</p>
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LinkedContent;