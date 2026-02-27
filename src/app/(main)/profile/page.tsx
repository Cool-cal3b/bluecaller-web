"use client";

import { LoginPageService } from "@/services/page-services.ts/login-page-service";
import { UserInfo } from "@/services/shared-services/user-info-storage";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

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
  }

  useEffect(() => {
    if (loginPageServiceRef.current.isLoggedIn()) {
      setUserInfo(loginPageServiceRef.current.getUserInfo());
    }
  }, [loginPageServiceRef.current.isLoggedIn()]);

  return (
    <div>
      <h1>Profile</h1>

      <div>
        <div>Profile Info</div>
        <div>
          <div>Username: {userInfo?.username}</div>
          <div>First Name: {userInfo?.firstName}</div>
          <div>Last Name: {userInfo?.lastName}</div>
          <div>Email: {userInfo?.email}</div>
          <div>Is Admin: {userInfo?.isAdmin ? 'Yes' : 'No'}</div>
        </div>
        <div>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </div>
    </div>
  );
}