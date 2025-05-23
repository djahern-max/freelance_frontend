import {
  LayoutDashboard,
  LogIn,
  LogOut,
  MessageSquareMore,
  UserCircle,
  User,
  CheckCircle,
  Video,
  Award,
  FileText,
  Home,
  Calendar,
  Check,
  Sparkles
} from 'lucide-react';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
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
  const location = useLocation();

  const openModal = (imageSrc, alt) => {
    setModalImage({ src: imageSrc, alt });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalImage(null);
  };

  // Placeholder function for Cal.com integration
  const handleBookingClick = () => {
    console.log('Booking button clicked - Cal.com integration coming soon');
    alert('Cal.com integration coming soon! For now, please contact me at [your email]');
  };

  // Define navigation items
  const navigationItems = [
    {
      path: '/showcase',
      icon: CheckCircle,
      title: 'Solutions',
      className: 'navSolutions'
    },
    {
      path: '/about',
      icon: User,
      title: 'Creators',
      className: 'navCreators'
    },
    {
      path: '/videos',
      icon: Video,
      title: 'Videos',
      className: 'navVideos'
    }
  ];

  // Add Home or Dashboard based on authentication status
  if (isAuthenticated) {
    navigationItems.unshift({
      path: userType === 'client' ? '/client-dashboard' : '/developer-dashboard',
      icon: LayoutDashboard,
      title: 'Dashboard',
      className: 'navDashboard'
    });
  } else {
    navigationItems.unshift({
      path: '/',
      icon: Home,
      title: 'Home',
      className: 'navHome'
    });
  }

  const menuItems = [
    {
      icon: Award,
      title: 'Coding Bootcamp',
      onClick: () => openModal(CodingBootcamp, 'Coding Bootcamp Certificate'),
      className: styles.bootcampMenuItem,
      rightIcon: Check,
      rightIconClass: styles.checkmark
    },
    {
      icon: FileText,
      title: 'CPA License',
      onClick: () => openModal(CPALicense, 'CPA License'),
      className: styles.cpaMenuItem,
      rightIcon: Check,
      rightIconClass: styles.checkmark
    },
    {
      icon: Calendar,
      title: 'Book a Call!',
      onClick: handleBookingClick,
      className: styles.bookingMenuItem,
      rightIcon: Sparkles,
      rightIconClass: styles.sparkles
    },
    {
      icon: MessageSquareMore,
      title: 'Feedback?',
      onClick: () => setShowFeedbackModal(true),
      className: styles.feedbackMenuItem
    },
    ...(isAuthenticated
      ? [

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

  const isActivePath = (path) => {
    return location.pathname === path;
  };

  return (
    <header className={styles.header}>
      <div className={styles.iconBar}>
        <div className={styles.leftSection}>
          {navigationItems.map((item) => (
            <div
              key={item.path || item.title}
              className={`${styles.icon} ${styles[item.className]} ${isActivePath(item.path) ? styles.active : ''}`}
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
                  {item.rightIcon && (
                    <item.rightIcon size={16} className={item.rightIconClass} />
                  )}
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