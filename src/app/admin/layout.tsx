import Link from "next/link";
import styles from "./layout.module.css";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.layoutAdmin}>
      <div className={styles.sidebar}>
        <h2>BlueCaller Admin</h2>
        <Link href="/">Back to Home</Link>
      </div>

      <div className={styles.pageContent}>
        {children}
      </div>
    </div>
  );
}
