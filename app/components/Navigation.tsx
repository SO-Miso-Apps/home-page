import { Link } from "react-router";
import { useState } from "react";
import styles from "./Navigation.module.css";

export const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className={styles.nav}>
      <div className={styles.navContainer}>
        <Link to="/" className={styles.navLogo} onClick={closeMenu}>
          <span className={styles.logoIcon}>🚀</span>
          <span className={styles.logoText}>Miso Apps</span>
        </Link>
        
        <button 
          className={styles.hamburger}
          onClick={toggleMenu}
          aria-label="Toggle menu"
          aria-expanded={isMenuOpen}
        >
          <span className={`${styles.hamburgerLine} ${isMenuOpen ? styles.hamburgerLineOpen : ''}`}></span>
          <span className={`${styles.hamburgerLine} ${isMenuOpen ? styles.hamburgerLineOpen : ''}`}></span>
          <span className={`${styles.hamburgerLine} ${isMenuOpen ? styles.hamburgerLineOpen : ''}`}></span>
        </button>

        <div className={`${styles.navMenuWrapper} ${isMenuOpen ? styles.navMenuWrapperOpen : ''}`}>
          <ul className={styles.navMenu}>
            <li><Link to="/" className={styles.navLink} onClick={closeMenu}>Home</Link></li>
            <li><Link to="/about" className={styles.navLink} onClick={closeMenu}>About Us</Link></li>
            <li><Link to="/products" className={styles.navLink} onClick={closeMenu}>Products</Link></li>
            <li><Link to="https://docs.misoapps.com" className={styles.navLink} onClick={closeMenu}>Docs</Link></li>
            <li><Link to="/privacy" className={styles.navLink} onClick={closeMenu}>Privacy</Link></li>
          </ul>
          
          <Link to="/products" className={styles.navCta} onClick={closeMenu}>
            Get Started
          </Link>
        </div>

        {isMenuOpen && (
          <div 
            className={styles.overlay} 
            onClick={closeMenu}
            aria-hidden="true"
          />
        )}
      </div>
    </nav>
  );
};
