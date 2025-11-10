import { Link } from "react-router";
import styles from "./Footer.module.css";

export const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContainer}>
        <div className={styles.footerGrid}>
          <div className={styles.footerSection}>
            <h3 className={styles.footerTitle}>
              <span className={styles.footerIcon}>🚀</span>
              Miso Apps
            </h3>
            <p className={styles.footerDescription}>
              Building innovative Shopify apps that transform e-commerce businesses and empower merchants worldwide.
            </p>
          </div>
          
          <div className={styles.footerSection}>
            <h4 className={styles.footerHeading}>Quick Links</h4>
            <ul className={styles.footerLinks}>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/products">Products</Link></li>
              <li><Link to="/privacy">Privacy Policy</Link></li>
            </ul>
          </div>
          
          <div className={styles.footerSection}>
            <h4 className={styles.footerHeading}>Contact</h4>
            <ul className={styles.footerLinks}>
              <li>📧 hello@misoapps.com</li>
              <li>📱 +1 (555) 123-4567</li>
              <li>📍 San Francisco, CA</li>
            </ul>
          </div>
          
          <div className={styles.footerSection}>
            <h4 className={styles.footerHeading}>Follow Us</h4>
            <div className={styles.socialLinks}>
              <a href="#" className={styles.socialLink}>Twitter</a>
              <a href="#" className={styles.socialLink}>LinkedIn</a>
              <a href="#" className={styles.socialLink}>GitHub</a>
            </div>
          </div>
        </div>
        
        <div className={styles.footerBottom}>
          <p>© {currentYear} Miso Apps. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
