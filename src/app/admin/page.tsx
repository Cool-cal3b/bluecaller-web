import styles from "./page.module.css";

export default function AdminPage() {
  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <div className={styles.eyebrow}>
          <span className={styles.eyebrowDot} />
          Admin Portal
        </div>
        <h1 className={styles.title}>Dashboard</h1>
        <p className={styles.description}>
          Tools to plan and manage the BlueCaller company.
        </p>
      </div>

      <div>
        <div className={styles.sectionTitle}>Tools</div>
        <div className={styles.toolGrid}>
          <div className={styles.toolCard}>
            <div className={styles.toolCardIcon}>
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z" />
              </svg>
            </div>
            <div className={styles.toolCardBody}>
              <span className={styles.toolCardTitle}>Feature Planning</span>
              <span className={styles.toolCardDesc}>Organize and track contractor projects and timelines.</span>
            </div>
            <span className={styles.toolCardBadge}>Coming Soon</span>
          </div>
        </div>
      </div>
    </div>
  );
}
