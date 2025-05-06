import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCircle } from 'lucide-react';
import api from '../../utils/api';
import styles from './ProfileButton.module.css';

const ProfileButton = () => {
    const [hasProfile, setHasProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const checkProfile = async () => {
            try {
                const response = await api.get('/profile/check-profile');
                setHasProfile(response.data.has_profile);
            } catch (error) {
                console.error('Error checking profile:', error);
                setHasProfile(false);
            } finally {
                setLoading(false);
            }
        };

        checkProfile();
    }, []);

    const handleProfileClick = () => {
        if (hasProfile) {
            navigate('/profile');
        } else {
            navigate('/profile/create');
        }
    };

    if (loading) {
        return (
            <button className={styles.profileButton} disabled>
                <UserCircle size={16} />
                <span>Checking profile...</span>
            </button>
        );
    }

    return (
        <button className={styles.profileButton} onClick={handleProfileClick}>
            <UserCircle size={16} />
            <span>{hasProfile ? 'View Profile' : 'Create Profile'}</span>
        </button>
    );
};

export default ProfileButton;