import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/api';
import './BurgerMenu.css';

const BurgerMenu = ({ isOpen, toggleMenu }) => {
  const navigate = useNavigate();
  const isAuthenticated = authService.isAuthenticated();

  const handleLogout = () => {
    authService.logout();
    toggleMenu();
    navigate('/');
  };

  const handleNavClick = () => {
    toggleMenu();
  };

  return (
    <nav className={`burger-menu ${isOpen ? 'open' : ''}`}>
      <div className="menu-header">
        <h2>Menu</h2>
      </div>
      <ul className="menu-list">
        <li>
          <Link to="/" onClick={handleNavClick}>
            🏠 Home
          </Link>
        </li>
        <li>
          <Link to="/ygo-binder" onClick={handleNavClick}>
            🃏 Yu-Gi-Oh Binder
          </Link>
        </li>
        {isAuthenticated ? (
          <>
            <li>
              <Link to="/ygo-binder/edit" onClick={handleNavClick}>
                ✏️ Edit Yu-Gi-Oh Binder
              </Link>
            </li>
            <li>
              <button onClick={handleLogout} className="logout-btn">
                🚪 Logout
              </button>
            </li>
          </>
        ) : (
          <li>
            <Link to="/login" onClick={handleNavClick}>
              🔐 Login
            </Link>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default BurgerMenu;
