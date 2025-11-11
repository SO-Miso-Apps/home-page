import { Link, NavLink } from "react-router";
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
          aria-controls="main-navigation"
        >
          <span className={`${styles.hamburgerLine} ${isMenuOpen ? styles.hamburgerLineOpen : ''}`}></span>
          <span className={`${styles.hamburgerLine} ${isMenuOpen ? styles.hamburgerLineOpen : ''}`}></span>
          <span className={`${styles.hamburgerLine} ${isMenuOpen ? styles.hamburgerLineOpen : ''}`}></span>
        </button>

        <div id="main-navigation" className={`${styles.navMenuWrapper} ${isMenuOpen ? styles.navMenuWrapperOpen : ''}`}>
          <ul className={styles.navMenu}>
            <li>
              <NavLink to="/" onClick={closeMenu} className={({ isActive }) => isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink} end>
                Home
              </NavLink>
            </li>
            <li>
              <NavLink to="/about" onClick={closeMenu} className={({ isActive }) => isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink}>
                About Us
              </NavLink>
            </li>
            <li>
              <NavLink to="/products" onClick={closeMenu} className={({ isActive }) => isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink}>
                Products
              </NavLink>
            </li>
            <li>
              {/* external docs should open in a new tab */}
              <a href="https://docs.misoapps.com" className={styles.navLink} onClick={closeMenu} target="_blank" rel="noopener noreferrer">Docs</a>
            </li>
            <li>
              <NavLink to="/privacy" onClick={closeMenu} className={({ isActive }) => isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink}>
                Privacy
              </NavLink>
            </li>
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
