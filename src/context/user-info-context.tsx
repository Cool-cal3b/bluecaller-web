"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { UserInfoStorageService, UserInfo } from "@/services/shared-services/user-info-storage";

interface UserInfoContextValue {
  userInfo: UserInfo | null;
  setUserInfo: (userInfo: UserInfo) => void;
  clearUserInfo: () => void;
}

const UserInfoContext = createContext<UserInfoContextValue | null>(null);

const storageService = new UserInfoStorageService();

export function UserInfoProvider({ children }: { children: React.ReactNode }) {
  const [userInfo, setUserInfoState] = useState<UserInfo | null>(null);

  useEffect(() => {
    setUserInfoState(storageService.getUserInfo());
  }, []);

  const setUserInfo = useCallback((info: UserInfo) => {
    storageService.setUserInfo(info);
    setUserInfoState(info);
  }, []);

  const clearUserInfo = useCallback(() => {
    storageService.clearUserInfo();
    setUserInfoState(null);
  }, []);

  return (
    <UserInfoContext.Provider value={{ userInfo, setUserInfo, clearUserInfo }}>
      {children}
    </UserInfoContext.Provider>
  );
}

export function useUserInfo() {
  const ctx = useContext(UserInfoContext);
  if (!ctx) throw new Error("useUserInfo must be used within a UserInfoProvider");
  return ctx;
}
