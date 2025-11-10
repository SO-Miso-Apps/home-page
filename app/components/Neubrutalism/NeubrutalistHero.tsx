import React from 'react';
import styles from './Neubrutalism.module.css';
import { NeubrutalistButton } from './NeubrutalistButton';

interface NeubrutalistHeroProps {
  title: string;
  subtitle: string;
  primaryCTA?: {
    text: string;
    href: string;
  };
  secondaryCTA?: {
    text: string;
    href: string;
  };
}

export const NeubrutalistHero: React.FC<NeubrutalistHeroProps> = ({
  title,
  subtitle,
  primaryCTA,
  secondaryCTA,
}) => {
  return (
    <div className={styles.neuHero}>
      <div className={styles.neuHeroContent}>
        <div className={styles.neuHeroDecoration}>
          <div className={styles.neuHeroShape1}></div>
          <div className={styles.neuHeroShape2}></div>
          <div className={styles.neuHeroShape3}></div>
        </div>
        
        <h1 className={styles.neuHeroTitle}>{title}</h1>
        <p className={styles.neuHeroSubtitle}>{subtitle}</p>
        
        <div className={styles.neuHeroButtons}>
          {primaryCTA && (
            <NeubrutalistButton href={primaryCTA.href} variant="primary" size="large">
              {primaryCTA.text}
            </NeubrutalistButton>
          )}
          {secondaryCTA && (
            <NeubrutalistButton href={secondaryCTA.href} variant="secondary" size="large">
              {secondaryCTA.text}
            </NeubrutalistButton>
          )}
        </div>
      </div>
    </div>
  );
};
