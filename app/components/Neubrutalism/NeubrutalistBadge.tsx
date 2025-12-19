import styles from "./Neubrutalism.module.css";

interface NeubrutalistBadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
}

export const NeubrutalistBadge = ({
  children,
  variant = 'default',
  size = 'medium'
}: NeubrutalistBadgeProps) => {
  const variantClass = styles[`neuBadge--${variant}`];
  const sizeClass = styles[`neuBadge--${size}`];

  return (
    <span className={`${styles.neuBadge} ${variantClass} ${sizeClass}`}>
      {children}
    </span>
  );
};
