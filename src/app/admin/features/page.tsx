"use client";

import Link from "next/link";
import styles from "./page.module.css";

export default function FeaturesPage() {
  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <div className={styles.eyebrow}>
          <span className={styles.eyebrowDot} />
          Admin
        </div>
        <h1 className={styles.title}>Manage BlueCaller Features</h1>
      </div>

      <div>
        <p className={styles.sectionTitle}>Sections</p>
        <div className={styles.grid}>
          <Link href="/admin/features/meetings" className={styles.card}>
            <div className={styles.cardIcon}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <div className={styles.cardBody}>
              <span className={styles.cardTitle}>Meetings</span>
              <span className={styles.cardDesc}>View and manage meeting records</span>
            </div>
          </Link>

          <Link href="/admin/features/all-features" className={styles.card}>
            <div className={styles.cardIcon}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </div>
            <div className={styles.cardBody}>
              <span className={styles.cardTitle}>Features</span>
              <span className={styles.cardDesc}>Browse all product features</span>
            </div>
          </Link>

          <Link href="/admin/features/all-action-items" className={styles.card}>
            <div className={styles.cardIcon}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 11 12 14 22 4" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </svg>
            </div>
            <div className={styles.cardBody}>
              <span className={styles.cardTitle}>Action Items</span>
              <span className={styles.cardDesc}>Track and manage action items</span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}