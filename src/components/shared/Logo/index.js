import { useNavigate } from 'react-router-dom';
import styles from './Logo.module.css';

const Logo = () => {
  const navigate = useNavigate();

  return (
    <img
      src="/favicon-32x32.png"
      alt="RYZE.ai"
      className={styles.logo}
      onClick={() => navigate('/')}
      style={{ cursor: 'pointer' }}
      height="32"
      width="32"
    />
  );
};

export default Logo;
