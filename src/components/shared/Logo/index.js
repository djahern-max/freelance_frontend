import { Link } from 'react-router-dom';
import styles from './Logo.module.css';

const Logo = ({ size = 'medium', clickable = true, className = '' }) => {
  const sizes = {
    tiny: '16px',
    small: '24px',
    medium: '32px',
    large: '48px',
    xlarge: '64px',
  };

  const logoComponent = (
    <div className={`${styles.logoWrapper} ${className}`}>
      <img
        src="/favicon.svg"
        alt="RYZE.ai"
        style={{ width: sizes[size] || size }}
        className={styles.logo}
      />
      <span className={styles.logoText}>RYZE.ai</span>
    </div>
  );

  return clickable ? (
    <Link to="/" className={styles.logoLink}>
      {logoComponent}
    </Link>
  ) : (
    logoComponent
  );
};

export default Logo;
