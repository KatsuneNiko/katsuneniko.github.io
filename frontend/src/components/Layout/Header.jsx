import './Header.css';

const Header = ({ title, toggleMenu, showListToggle, isListOpen, toggleList }) => {
  return (
    <header className="header">
      <button className="burger-icon" onClick={toggleMenu} aria-label="Toggle menu">
        <span></span>
        <span></span>
        <span></span>
      </button>
      <h1 className="header-title">{title}</h1>
      {showListToggle && (
        <button 
          className={`list-toggle-icon ${isListOpen ? 'open' : ''}`}
          onClick={toggleList} 
          aria-label={isListOpen ? 'Close list' : 'Open list'}
        >
          <span className="triangle"></span>
        </button>
      )}
    </header>
  );
};

export default Header;
