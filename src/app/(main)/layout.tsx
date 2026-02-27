"use client";

import Link from "next/link";
import styles from "./layout.module.css";
import { UserInfoProvider, useUserInfo } from "@/context/user-info-context";

function MainLayoutInner({ children }: { children: React.ReactNode }) {
  const { userInfo } = useUserInfo();

  const getInitials = () => {
    if (!userInfo?.firstName) return null;
    return `${userInfo.firstName[0]}${userInfo.lastName?.[0] ?? ""}`;
  };

  const getProfileLabel = () => {
    if (!userInfo) return "Sign in";
    if (userInfo.firstName) return `${userInfo.firstName} ${userInfo.lastName}`;
    return "Profile";
  };

  const initials = getInitials();

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <div className={styles.logoMark}>
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24 11.47 11.47 0 003.58.57 1 1 0 011 1V21a1 1 0 01-1 1A17 17 0 013 5a1 1 0 011-1h3.5a1 1 0 011 1 11.47 11.47 0 00.57 3.58 1 1 0 01-.25 1.01l-2.2 2.2z" />
            </svg>
          </div>
          <span className={styles.brandName}>BlueCaller</span>
        </div>

        <nav className={styles.nav}>
          <Link href="/" className={styles.navLink}>
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
            </svg>
            Home
          </Link>
          {userInfo?.isAdmin && (
            <Link href="/admin" className={styles.navLink}>
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2a5 5 0 100 10A5 5 0 0012 2zm0 12c-5.33 0-8 2.67-8 4v2h16v-2c0-1.33-2.67-4-8-4z" />
              </svg>
              Admin Portal
            </Link>
          )}
        </nav>

        <div className={styles.sidebarFooter}>
          <Link href="/profile" className={styles.profileLink}>
            {initials ? (
              <div className={styles.avatar}>{initials}</div>
            ) : (
              <div className={styles.avatarIcon}>
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2a5 5 0 100 10A5 5 0 0012 2zm0 12c-5.33 0-8 2.67-8 4v2h16v-2c0-1.33-2.67-4-8-4z" />
                </svg>
              </div>
            )}
            <span className={styles.profileName}>{getProfileLabel()}</span>
          </Link>
        </div>
      </aside>

      <div className={styles.pageContent}>
        {children}
      </div>
    </div>
  );
}

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <UserInfoProvider>
      <MainLayoutInner>{children}</MainLayoutInner>
    </UserInfoProvider>
  );
}
