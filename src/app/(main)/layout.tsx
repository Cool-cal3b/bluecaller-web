"use client";

import Link from "next/link";
import styles from "./layout.module.css";
import { useRef } from "react";
import { UserInfo, UserInfoStorageService } from "@/services/shared-services/user-info-storage";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userInfoHelperRef = useRef<UserInfoStorageService>(new UserInfoStorageService());
  const userInfo = userInfoHelperRef.current.getUserInfo();

  const getProfilePageText = () => {
    if (!userInfo) return 'Sign in';
    if (userInfo.firstName) return `${userInfo.firstName} ${userInfo.lastName}`;
    return 'Profile';
  }

  return (
    <div className={styles.layout}>
      <div className={styles.sidebar}>
        <h2>BlueCaller</h2>
        <Link href="/profile">{getProfilePageText()}</Link>
        <Link href="/">Home</Link>
        {userInfo?.isAdmin && <Link href="/admin">Admin Portal</Link>}
      </div>

      <div className={styles.pageContent}>
        {children}
      </div>
    </div>
  );
}
