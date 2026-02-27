"use client";

import { LoginPageService } from "@/services/page-services.ts/login-page-service";
import { UserInfo } from "@/services/shared-services/user-info-storage";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import styles from "./profile.module.css";

export default function ProfilePage() {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const loginPageServiceRef = useRef<LoginPageService>(new LoginPageService());
  if (!loginPageServiceRef.current.isLoggedIn()) {
    router.push('/profile/login');
  }

  const handleLogout = () => {
    loginPageServiceRef.current.logout();
    router.push('/profile/login');
  };

  useEffect(() => {
    if (loginPageServiceRef.current.isLoggedIn()) {
      setUserInfo(loginPageServiceRef.current.getUserInfo());
    }
  }, [loginPageServiceRef.current.isLoggedIn()]);

  const getInitials = () => {
    if (!userInfo?.firstName) return null;
    return `${userInfo.firstName[0]}${userInfo.lastName?.[0] ?? ""}`;
  };

  const initials = getInitials();

  const fields: { label: string; value: string | undefined }[] = [
    { label: "Username", value: userInfo?.username },
    { label: "First Name", value: userInfo?.firstName },
    { label: "Last Name", value: userInfo?.lastName },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.heading}>
        <h1>Your Profile</h1>
        <p>Account details</p>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          {initials ? (
            <div className={styles.avatarLarge}>{initials}</div>
          ) : (
            <div className={styles.avatarLargeIcon}>
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2a5 5 0 100 10A5 5 0 0012 2zm0 12c-5.33 0-8 2.67-8 4v2h16v-2c0-1.33-2.67-4-8-4z" />
              </svg>
            </div>
          )}
          <div className={styles.cardHeaderText}>
            <strong>
              {userInfo?.firstName
                ? `${userInfo.firstName} ${userInfo.lastName ?? ""}`.trim()
                : "Signed In"}
            </strong>
            <span>{userInfo?.email ?? userInfo?.username ?? ""}</span>
          </div>
        </div>

        <div className={styles.fieldList}>
          {fields.map(({ label, value }) => (
            <div key={label} className={styles.field}>
              <span className={styles.fieldLabel}>{label}</span>
              {value ? (
                <span className={styles.fieldValue}>{value}</span>
              ) : (
                <span className={styles.fieldValueEmpty}>—</span>
              )}
            </div>
          ))}
        </div>

        <div className={styles.actions}>
          <button className={styles.logoutButton} onClick={handleLogout}>
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5-5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
            </svg>
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
