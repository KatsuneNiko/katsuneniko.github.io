import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-left">
          <p>&copy; {new Date().getFullYear()} KatsuneNiko. All rights reserved.</p>
        </div>
        <div className="footer-right">
          <span className="contact-label">Contact:</span>
          <div className="contact-links">
            <a 
              href="https://github.com/KatsuneNiko/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="contact-link"
            >
              <span className="icon">📘</span> GitHub
            </a>
            <a 
              href="mailto:crystallizedlumina@gmail.com" 
              className="contact-link"
            >
              <span className="icon">✉️</span> Email
            </a>
            <a 
              href="tel:+61406718148" 
              className="contact-link"
            >
              <span className="icon">📞</span> +61 406 718 148
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
