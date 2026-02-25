import Link from "next/link";
import styles from "./layout.module.css";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.layout}>
      <div className={styles.sidebar}>
        <h2>BlueCaller</h2>
        <Link href="/admin">Admin Portal</Link>
      </div>

      <div className={styles.pageContent}>
        {children}
      </div>
    </div>
  );
}
