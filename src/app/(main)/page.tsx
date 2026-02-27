import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.container}>
      <div className={styles.badge}>
        <span className={styles.badgeDot} />
        In Development
      </div>

      <div className={styles.heading}>
        <h1>Welcome to BlueCaller</h1>
        <p>
          Online tools for BlueCaller are on the way. For now, this portal is
          available for administrators.
        </p>
      </div>

      <div className={styles.divider} />

      <Link href="/admin" className={styles.card}>
        <div className={styles.cardRow}>
          <div className={styles.cardIcon}>
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2a5 5 0 100 10A5 5 0 0012 2zm0 12c-5.33 0-8 2.67-8 4v2h16v-2c0-1.33-2.67-4-8-4z" />
            </svg>
          </div>
          <div className={styles.cardText}>
            <strong>Admin Portal</strong>
            Administrators can sign in to access the management portal.
          </div>
        </div>
      </Link>
    </div>
  );
}
