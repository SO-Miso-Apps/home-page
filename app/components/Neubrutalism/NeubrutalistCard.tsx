import React from 'react';
import styles from './Neubrutalism.module.css';

interface NeubrutalistCardProps {
  title: string;
  description: string;
  icon?: string;
  color?: 'blue' | 'red' | 'yellow' | 'green' | 'purple';
  href?: string;
}

export const NeubrutalistCard: React.FC<NeubrutalistCardProps> = ({
  title,
  description,
  icon = '✨',
  color = 'blue',
  href,
}) => {
  const content = (
    <>
      <div className={`${styles.neuCardIcon} ${styles[`neuCardIcon--${color}`]}`}>
        {icon}
      </div>
      <h3 className={styles.neuCardTitle}>{title}</h3>
      <p className={styles.neuCardDescription}>{description}</p>
    </>
  );

  if (href) {
    return (
      <a href={href} className={`${styles.neuCard} ${styles[`neuCard--${color}`]}`}>
        {content}
      </a>
    );
  }

  return (
    <div className={`${styles.neuCard} ${styles[`neuCard--${color}`]}`}>
      {content}
    </div>
  );
};
