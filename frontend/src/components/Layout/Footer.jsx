import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>Contact Information</h3>
          <div className="contact-links">
            <a 
              href="https://github.com/KatsuneNiko/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="contact-link"
            >
              <span className="icon">📘</span> GitHub: KatsuneNiko
            </a>
            <a 
              href="mailto:crystallizedlumina@gmail.com" 
              className="contact-link"
            >
              <span className="icon">✉️</span> Email: crystallizedlumina@gmail.com
            </a>
            <a 
              href="tel:+61406718148" 
              className="contact-link"
            >
              <span className="icon">📞</span> Phone: +61 406 718 148
            </a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} KatsuneNiko. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
