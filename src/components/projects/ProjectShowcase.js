// ProjectShowcase.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ExternalLink, Github, Play } from 'lucide-react';
import api from '../../utils/api';
import Header from '../shared/Header';
import styles from './ProjectShowcase.module.css';

const ProjectShowcase = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const response = await api.get('/projects/showcase');
            setProjects(response.data);
        } catch (error) {
            console.error('Failed to fetch showcase projects:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className={styles.loadingContainer}>Loading...</div>;
    }

    return (
        <div className={styles.container}>
            <Header />
            <div className={styles.content}>
                <h1 className={styles.title}>Developer Showcase</h1>

                <div className={styles.projectGrid}>
                    {projects.map((project) => (
                        <div key={project.id} className={styles.projectCard}>
                            {project.videos[0] && (
                                <div className={styles.videoPreview}>
                                    <img
                                        src={project.videos[0].thumbnail_path}
                                        alt={project.name}
                                        className={styles.thumbnail}
                                    />
                                    <button
                                        className={styles.playButton}
                                        onClick={() => navigate(`/videos/${project.videos[0].id}`)}
                                    >
                                        <Play className={styles.playIcon} />
                                    </button>
                                </div>
                            )}

                            <div className={styles.projectContent}>
                                <h2 className={styles.projectTitle}>{project.name}</h2>
                                <p className={styles.description}>{project.description}</p>

                                {project.technologies.length > 0 && (
                                    <div className={styles.technologiesContainer}>
                                        <div className={styles.technologies}>
                                            {project.technologies.map((tech) => (
                                                <span
                                                    key={tech}
                                                    className={styles.techTag}
                                                >
                                                    {tech}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className={styles.links}>
                                    {project.live_url && (
                                        <a
                                            href={project.live_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={styles.liveDemo}
                                        >
                                            <ExternalLink className={styles.icon} />
                                            Live Demo
                                        </a>
                                    )}
                                    {project.repository_url && (
                                        <a
                                            href={project.repository_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={styles.repository}
                                        >
                                            <Github className={styles.icon} />
                                            Repository
                                        </a>
                                    )}
                                </div>

                                <div className={styles.userInfo}>
                                    <div className={styles.userProfile}>
                                        {project.user.profile_image_url ? (
                                            <img
                                                src={project.user.profile_image_url}
                                                alt={project.user.username}
                                                className={styles.profileImage}
                                            />
                                        ) : (
                                            <div className={styles.profilePlaceholder} />
                                        )}
                                        <div className={styles.userDetails}>
                                            <p className={styles.userName}>
                                                {project.user.full_name}
                                            </p>
                                            <p className={styles.projectStatus}>
                                                {project.development_status}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ProjectShowcase;