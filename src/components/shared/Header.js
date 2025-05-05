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
  Calendar
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

  // Placeholder function for Cal.com integration
  const handleBookingClick = () => {
    // This will be replaced with Cal.com integration
    console.log('Booking button clicked - Cal.com integration coming soon');
    // For now, you could show an alert, open a modal, redirect to a contact form, etc.
    alert('Cal.com integration coming soon! For now, please contact me at [your email]');
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

  // Add Home or Dashboard based on authentication status
  if (isAuthenticated) {
    navigationItems.unshift({
      path: userType === 'client' ? '/client-dashboard' : '/developer-dashboard',
      icon: LayoutDashboard,
      title: 'Dashboard'
    });
  } else {
    navigationItems.unshift({
      path: '/',
      icon: Home,
      title: 'Home'
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
      icon: Calendar,
      title: 'Book a Call',
      onClick: handleBookingClick,
      className: styles.bookingMenuItem
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