import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import BurgerMenu from './BurgerMenu';
import './Layout.css';

const Layout = ({ children, showListToggle, isListOpen, toggleList }) => {
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
        return 'Edit Yu-Gi-Oh Binder';
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
        <Header 
          title={getPageTitle()} 
          toggleMenu={toggleMenu}
          showListToggle={showListToggle}
          isListOpen={isListOpen}
          toggleList={toggleList}
        />
        <main className="main-content">
          {children}
        </main>
        <Footer />
      </div>
      {isMenuOpen && <div className="overlay" onClick={toggleMenu}></div>}
      {isListOpen && <div className="overlay list-overlay" onClick={toggleList}></div>}
    </div>
  );
};

export default Layout;
