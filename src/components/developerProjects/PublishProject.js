// src/components/developerProjects/PublishProject.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import styles from './PublishProject.module.css';

const PublishProject = ({ onClose }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        readme: '',
        video_ids: []
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await api.showcase.create(formData);
            if (onClose) onClose();
            navigate('/showcase');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div className={styles.modal}>
            <div className={styles.modalContent}>
                <h2>Publish Project</h2>

                {error && <div className={styles.error}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label htmlFor="title">Project Title</label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="description">Description</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            required
                            rows={4}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="readme">README</label>
                        <textarea
                            id="readme"
                            name="readme"
                            value={formData.readme}
                            onChange={handleInputChange}
                            rows={6}
                            placeholder="Add installation instructions, usage examples, or any other relevant information..."
                        />
                    </div>

                    <div className={styles.buttonGroup}>
                        <button
                            type="button"
                            onClick={onClose}
                            className={styles.cancelButton}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className={styles.submitButton}
                            disabled={loading}
                        >
                            {loading ? 'Publishing...' : 'Publish'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PublishProject;