import React from 'react';
import styles from './Neubrutalism.module.css';

interface NeubrutalistButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
  variant?: 'primary' | 'secondary' | 'accent' | 'warning';
  size?: 'small' | 'medium' | 'large';
}

export const NeubrutalistButton: React.FC<NeubrutalistButtonProps> = ({
  children,
  onClick,
  href,
  variant = 'primary',
  size = 'medium',
}) => {
  const className = `${styles.neuButton} ${styles[`neuButton--${variant}`]} ${styles[`neuButton--${size}`]}`;

  if (href) {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    );
  }

  return (
    <button onClick={onClick} className={className}>
      {children}
    </button>
  );
};
