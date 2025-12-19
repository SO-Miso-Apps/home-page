import { Link } from "react-router";
import { Rocket, Mail, Phone, MapPin, Twitter, Linkedin, Github } from "lucide-react";
import styles from "./Footer.module.css";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.footerContainer}>
        <div className={styles.footerGrid}>
          <div className={styles.footerSection}>
            <h3 className={styles.footerTitle}>
              <Rocket className={styles.footerIcon} size={20} strokeWidth={2.5} />
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
              <li className={styles.contactItem}>
                <Mail size={16} strokeWidth={2} />
                hi@misoapps.com
              </li>
              <li className={styles.contactItem}>
                <Phone size={16} strokeWidth={2} />
                +84 35-7654-619
              </li>
              <li className={styles.contactItem}>
                <MapPin size={16} strokeWidth={2} />
                Hanoi, Vietnam
              </li>
            </ul>
          </div>

          <div className={styles.footerSection}>
            <h4 className={styles.footerHeading}>Follow Us</h4>
            <div className={styles.socialLinks}>
              <a href="#" className={styles.socialLink} aria-label="Twitter">
                <Twitter size={20} strokeWidth={2} />
              </a>
              <a href="#" className={styles.socialLink} aria-label="LinkedIn">
                <Linkedin size={20} strokeWidth={2} />
              </a>
              <a href="#" className={styles.socialLink} aria-label="GitHub">
                <Github size={20} strokeWidth={2} />
              </a>
            </div>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <p>&copy; {currentYear} Miso Apps. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
