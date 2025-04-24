import logo from '../../../images/logo1.png'; // or wherever your logo lives

const Logo = ({ className }) => (
  <img src={logo} alt="Freelance.wtf Logo" className={className} />
);

export default Logo;