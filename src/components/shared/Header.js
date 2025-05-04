import {
  LayoutDashboard,
  LogIn,
  LogOut,
  MessageSquareMore,
  UserCircle,
  User,
  CheckCircle,
  Video,
  Award
} from 'lucide-react';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import AuthDialog from '../auth/AuthDialog';
import FeedbackModal from '../feedback/FeedbackModal';
import SharedRequestNotification from '../requests/SharedRequestNotification';
import styles from './Header.module.css';
import HeaderMenu from './HeaderMenu';
import ImageModal from './ImageModal';
import CodingBootcamp from '../../images/CodingBootcamp.png';
import CPALicense from '../../images/CPALicense.png';

const Header = () => {
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [modalImage, setModalImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const userType = useSelector((state) => state.auth.userType);
  const navigate = useNavigate();

  const openModal = (imageSrc, alt) => {
    setModalImage({ src: imageSrc, alt });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalImage(null);
  };

  // Define navigation items
  const navigationItems = [
    {
      path: '/showcase',
      icon: CheckCircle,
      title: 'Solutions'
    },
    {
      path: '/creators',
      icon: User,
      title: 'Creators'
    },
    {
      path: '/videos',
      icon: Video,
      title: 'Videos'
    }
  ];

  // Only add Dashboard if user is authenticated
  if (isAuthenticated) {
    navigationItems.unshift({
      path: userType === 'client' ? '/client-dashboard' : '/developer-dashboard',
      icon: LayoutDashboard,
      title: 'Dashboard'
    });
  }

  const menuItems = [
    {
      icon: Award,
      title: 'Bootcamp Certificate',
      onClick: () => openModal(CodingBootcamp, 'Coding Bootcamp Certificate'),
      className: styles.bootcampMenuItem
    },
    {
      icon: FileText,
      title: 'CPA License',
      onClick: () => openModal(CPALicense, 'CPA License'),
      className: styles.cpaMenuItem
    },
    {
      icon: MessageSquareMore,
      title: 'Feedback',
      onClick: () => setShowFeedbackModal(true)
    },
    ...(isAuthenticated
      ? [
        {
          icon: UserCircle,
          title: 'Profile',
          onClick: () => navigate('/profile')
        },
        {
          icon: LogOut,
          title: 'Logout',
          onClick: () => {
            dispatch({ type: 'LOGOUT' });
            navigate('/login');
          }
        }
      ]
      : [])
  ];

  return (
    <header className={styles.header}>
      <div className={styles.iconBar}>
        <div className={styles.leftSection}>
          {navigationItems.map((item) => (
            <div
              key={item.path || item.title}
              className={styles.icon}
              onClick={() => navigate(item.path)}
              title={item.title}
            >
              <item.icon
                className={styles.iconImage}
                size={24}
                strokeWidth={1.5}
              />
            </div>
          ))}
        </div>

        <div className={styles.rightSection}>
          {isAuthenticated && userType === 'developer' && (
            <div className={styles.notificationContainer}>
              <SharedRequestNotification />
            </div>
          )}

          <div className={styles.menuContainer}>
            <HeaderMenu>
              {menuItems.map((item, index) => (
                <button
                  key={index}
                  className={`${styles.menuItem} ${item.className || ''}`}
                  onClick={item.onClick}
                >
                  <item.icon size={20} />
                  <span>{item.title}</span>
                </button>
              ))}
            </HeaderMenu>
          </div>
          {!isAuthenticated && (
            <button
              className={styles.signInButton}
              onClick={() => setShowAuthDialog(true)}
            >
              <LogIn size={20} />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>

      {showFeedbackModal && (
        <FeedbackModal
          location="header"
          targetId="general_feedback"
          onClose={() => setShowFeedbackModal(false)}
        />
      )}

      <AuthDialog
        isOpen={showAuthDialog}
        onClose={() => setShowAuthDialog(false)}
        onLogin={() => {
          setShowAuthDialog(false);
          navigate('/login');
        }}
        onRegister={() => {
          setShowAuthDialog(false);
          navigate('/register');
        }}
      />

      <ImageModal
        isOpen={isModalOpen}
        onClose={closeModal}
        imageSrc={modalImage?.src}
        alt={modalImage?.alt}
      />
    </header>
  );
};

export default Header;