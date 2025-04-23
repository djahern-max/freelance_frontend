import {
  LayoutDashboard,
  LogIn,
  LogOut,
  MessageSquareMore,
  Search,
  UserCircle,
  UsersRound,
  CheckCircle,
  Video,
  Heart
} from 'lucide-react';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import AuthDialog from '../auth/AuthDialog';
import FeedbackModal from '../feedback/FeedbackModal';
import SharedRequestNotification from '../requests/SharedRequestNotification';
import styles from './Header.module.css';
import HeaderMenu from './HeaderMenu';
import { stripeService } from '../../utils/stripeService';
import DonationModal from '../payments/DonationModal';

const Header = () => {
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const userType = useSelector((state) => state.auth.userType);
  const navigate = useNavigate();
  const [showDonationModal, setShowDonationModal] = useState(false);

  const handleDonation = async () => {
    try {
      const response = await stripeService.createDonationSession({
        amount: 500, // $5 default donation
        currency: 'usd'
      });
      if (response.url) {
        window.location.href = response.url;
      }
    } catch (error) {
      console.error('Donation error:', error);
      // You could add toast notification here if you want
    }
  };

  const handleDonationClick = () => {
    setShowDonationModal(true);
  };

  // Define navigation items
  const navigationItems = [
    {
      path: '/tickets',
      icon: Search,
      title: 'tickets'
    },
    // {
    //   path: '/showcase',
    //   icon: CheckCircle,
    //   title: 'Solutions'
    // },
    {
      path: '/creators',
      icon: UsersRound,
      title: 'Creators'
    },
    {
      path: '/videos',
      icon: Video,
      title: 'Videos'
    },
    {
      icon: Heart,
      title: 'Support Freelance.wtf',
      onClick: handleDonation,
      isSpecial: true // Add this flag for special styling
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
      icon: Heart,
      title: 'Support Freelance.wtf',
      onClick: handleDonation,
      isSpecial: true // Add this flag for special styling
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
              className={`${styles.icon} ${item.isSpecial ? styles.specialIcon : ''}`}
              onClick={item.isSpecial ? handleDonationClick : (() => navigate(item.path))}
              title={item.title}
            >
              <item.icon
                className={styles.iconImage}
                size={24}
                strokeWidth={1.5}
                style={item.isSpecial ? {
                  color: '#ef4444',
                  fill: '#ef4444',
                  transform: 'scale(1.1)'
                } : {}}
              />
            </div>
          ))}
        </div>

        {showDonationModal && (
          <DonationModal onClose={() => setShowDonationModal(false)} />
        )}

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
                  className={`${styles.menuItem} ${item.isSpecial ? styles.specialMenuItem : ''}`}
                  onClick={item.onClick}
                >
                  <item.icon
                    size={20}
                    style={item.isSpecial ? {
                      color: '#ef4444',
                      fill: '#ef4444'
                    } : {}}
                  />
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
    </header>
  );
};

export default Header;