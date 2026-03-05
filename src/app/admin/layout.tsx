"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./layout.module.css";
import { UserInfoStorageService } from "@/services/shared-services/user-info-storage";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const userInfo = new UserInfoStorageService().getUserInfo();
    setIsAuthorized(userInfo?.isAdmin ?? false);
  }, [router]);

  const closeMenu = () => setMenuOpen(false);

  if (isAuthorized !== true) {
    return (
      <div className={styles.layoutAdmin}>
        <div className={styles.pageContent}>
          <div className={styles.backLinkContainer}>
            <Link href="/" className={styles.backLink}>
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" /></svg> Back to main site
            </Link>
          </div>
          <h1>Unauthorized</h1>
          <p>You are not authorized to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.layoutAdmin}>
      <div className={styles.menuToggle}>
        <div className={styles.menuToggleBrand}>
          <div className={styles.logoMark}>
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24 11.47 11.47 0 003.58.57 1 1 0 011 1V21a1 1 0 01-1 1A17 17 0 013 5a1 1 0 011-1h3.5a1 1 0 011 1 11.47 11.47 0 00.57 3.58 1 1 0 01-.25 1.01l-2.2 2.2z" />
            </svg>
          </div>
          <div className={styles.brandWrap}>
            <span className={styles.menuToggleBrandName}>BlueCaller</span>
            <span className={styles.menuToggleBadge}>Admin</span>
          </div>
        </div>
        <button className={styles.menuToggleBtn} onClick={() => setMenuOpen(true)} aria-label="Open menu">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
          </svg>
        </button>
      </div>

      <div
        className={`${styles.overlay}${menuOpen ? ` ${styles.overlayVisible}` : ""}`}
        onClick={closeMenu}
      />

      <aside className={`${styles.sidebar}${menuOpen ? ` ${styles.sidebarOpen}` : ""}`}>
        <div className={styles.sidebarHeader}>
          <div className={styles.logoMark}>
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24 11.47 11.47 0 003.58.57 1 1 0 011 1V21a1 1 0 01-1 1A17 17 0 013 5a1 1 0 011-1h3.5a1 1 0 011 1 11.47 11.47 0 00.57 3.58 1 1 0 01-.25 1.01l-2.2 2.2z" />
            </svg>
          </div>
          <div className={styles.brandWrap}>
            <span className={styles.brandName}>BlueCaller</span>
            <span className={styles.brandBadge}>Admin</span>
          </div>
        </div>

        <span className={styles.sectionLabel}>Navigation</span>

        <nav className={styles.nav}>
          <Link href="/admin" onClick={closeMenu} className={`${styles.navLink}${pathname === "/admin" ? ` ${styles.navLinkActive}` : ""}`}>
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
            </svg>
            Dashboard
          </Link>

          <Link href="/admin/features" onClick={closeMenu} className={`${styles.navLink}${pathname.startsWith("/admin/features") ? ` ${styles.navLinkActive}` : ""}`}>
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2a5 5 0 100 10A5 5 0 0012 2zm0 12c-5.33 0-8 2.67-8 4v2h16v-2c0-1.33-2.67-4-8-4z" />
            </svg>
            Features
          </Link>
        </nav>

        <div className={styles.sidebarFooter}>
          <Link href="/" onClick={closeMenu} className={styles.backLink}>
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
            </svg>
            Back to main site
          </Link>
        </div>
      </aside>

      <div className={styles.pageContent}>
        {children}
      </div>
    </div>
  );
}
