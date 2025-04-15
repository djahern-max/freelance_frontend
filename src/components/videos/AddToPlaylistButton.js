// src/components/videos/AddToPlaylistButton.js
import React, { useState } from 'react';
import AddToPlaylistModal from './AddToPlaylistModal';
import styles from './AddToPlaylistButton.module.css';
import { useSelector } from 'react-redux';

const AddToPlaylistButton = ({ videoId, videoOwnerId }) => {
    const [showModal, setShowModal] = useState(false);
    const currentUser = useSelector(state => state.auth.user);
    const isOwner = currentUser?.id === videoOwnerId;

    const handleOpenModal = () => {
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    return (
        <>
            <button
                className={styles.addToPlaylistButton}
                onClick={handleOpenModal}
                aria-label={isOwner ? "Manage Playlist" : "Add to Playlist"}
            >
                <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={styles.plusIcon}
                >
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                <span>{isOwner ? "Manage Playlist" : "Add to Playlist"}</span>
            </button>

            {showModal && (
                <AddToPlaylistModal
                    videoId={videoId}
                    videoOwnerId={videoOwnerId}
                    isOwner={isOwner}
                    onClose={handleCloseModal}
                />
            )}
        </>
    );
};

export default AddToPlaylistButton;