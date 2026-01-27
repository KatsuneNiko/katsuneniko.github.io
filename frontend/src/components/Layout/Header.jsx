import './Header.css';

const Header = ({ title, toggleMenu }) => {
  return (
    <header className="header">
      <button className="burger-icon" onClick={toggleMenu} aria-label="Toggle menu">
        <span></span>
        <span></span>
        <span></span>
      </button>
      <h1 className="header-title">{title}</h1>
    </header>
  );
};

export default Header;
