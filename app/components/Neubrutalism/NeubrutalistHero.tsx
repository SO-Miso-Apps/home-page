import styles from "./Neubrutalism.module.css";
import { NeubrutalistButton } from "./NeubrutalistButton";

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

export const NeubrutalistHero = ({
  title,
  subtitle,
  primaryCTA,
  secondaryCTA
}: NeubrutalistHeroProps) => {
  return (
    <section className={styles.neuHero}>
      <div className={styles.neuHeroDecoration}>
        <div className={styles.neuHeroShape1}></div>
        <div className={styles.neuHeroShape2}></div>
        <div className={styles.neuHeroShape3}></div>
      </div>

      <div className={styles.neuHeroContent}>
        <h1 className={styles.neuHeroTitle}>{title}</h1>
        <p className={styles.neuHeroSubtitle}>{subtitle}</p>

        {(primaryCTA || secondaryCTA) && (
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
        )}
      </div>
    </section>
  );
};
