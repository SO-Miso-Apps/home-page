import { Link } from "react-router";
import styles from "./Neubrutalism.module.css";

interface NeubrutalistButtonProps {
  children: React.ReactNode;
  href?: string;
  variant?: 'primary' | 'secondary' | 'accent' | 'warning';
  size?: 'small' | 'medium' | 'large';
  onClick?: () => void;
  type?: 'button' | 'submit';
}

export const NeubrutalistButton = ({
  children,
  href,
  variant = 'primary',
  size = 'medium',
  onClick,
  type = 'button'
}: NeubrutalistButtonProps) => {
  const variantClass = styles[`neuButton--${variant}`];
  const sizeClass = styles[`neuButton--${size}`];
  const className = `${styles.neuButton} ${variantClass} ${sizeClass}`;

  if (href) {
    return (
      <Link to={href} className={className}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} className={className}>
      {children}
    </button>
  );
};
