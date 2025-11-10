import React from 'react';
import styles from './Neubrutalism.module.css';

interface NeubrutalistBadgeProps {
  children: React.ReactNode;
  variant?: 'blue' | 'red' | 'yellow' | 'green' | 'purple' | 'pink';
  size?: 'small' | 'medium' | 'large';
}

export const NeubrutalistBadge: React.FC<NeubrutalistBadgeProps> = ({
  children,
  variant = 'blue',
  size = 'medium',
}) => {
  return (
    <span className={`${styles.neuBadge} ${styles[`neuBadge--${variant}`]} ${styles[`neuBadge--${size}`]}`}>
      {children}
    </span>
  );
};

interface NeubrutalistNotificationProps {
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  onClose?: () => void;
}

export const NeubrutalistNotification: React.FC<NeubrutalistNotificationProps> = ({
  title,
  message,
  type = 'info',
  onClose,
}) => {
  const icons = {
    info: '💡',
    success: '✅',
    warning: '⚠️',
    error: '❌'
  };

  const colors = {
    info: 'blue',
    success: 'green',
    warning: 'yellow',
    error: 'red'
  };

  return (
    <div className={`${styles.neuNotification} ${styles[`neuNotification--${colors[type]}`]}`}>
      <div className={styles.neuNotificationIcon}>{icons[type]}</div>
      <div className={styles.neuNotificationContent}>
        <h4 className={styles.neuNotificationTitle}>{title}</h4>
        <p className={styles.neuNotificationMessage}>{message}</p>
      </div>
      {onClose && (
        <button className={styles.neuNotificationClose} onClick={onClose}>
          ✕
        </button>
      )}
    </div>
  );
};
