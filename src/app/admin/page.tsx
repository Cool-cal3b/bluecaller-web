import styles from "./page.module.css";

export default function AdminPage() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Admin Dashboard</h1>
      <p className={styles.description}>
        Welcome to the BlueCaller admin portal. Manage your contractor business from here.
      </p>
    </div>
  );
}