import { Link } from "react-router";
import styles from "./Neubrutalism.module.css";

interface NeubrutalistCardProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  href?: string;
}

export const NeubrutalistCard = ({
  icon,
  title,
  description,
  href
}: NeubrutalistCardProps) => {
  const cardContent = (
    <>
      {icon && (
        <div className={styles.neuCardIcon}>
          {icon}
        </div>
      )}
      <h3 className={styles.neuCardTitle}>{title}</h3>
      <p className={styles.neuCardDescription}>{description}</p>
    </>
  );

  if (href) {
    return (
      <Link to={href} className={styles.neuCard}>
        {cardContent}
      </Link>
    );
  }

  return (
    <div className={styles.neuCard}>
      {cardContent}
    </div>
  );
};
