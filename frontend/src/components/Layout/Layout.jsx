import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import BurgerMenu from './BurgerMenu';
import './Layout.css';

const Layout = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname;
    switch (path) {
      case '/':
        return 'Home Page';
      case '/binder':
        return 'Yu-Gi-Oh Binder';
      case '/binder/edit':
        return 'Yu-Gi-Oh Binder Edit';
      case '/login':
        return 'Login';
      default:
        return 'KatsuneNiko';
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="layout">
      <BurgerMenu isOpen={isMenuOpen} toggleMenu={toggleMenu} />
      <div className={`layout-content ${isMenuOpen ? 'menu-open' : ''}`}>
        <Header title={getPageTitle()} toggleMenu={toggleMenu} />
        <main className="main-content">
          {children}
        </main>
        <Footer />
      </div>
      {isMenuOpen && <div className="overlay" onClick={toggleMenu}></div>}
    </div>
  );
};

export default Layout;
