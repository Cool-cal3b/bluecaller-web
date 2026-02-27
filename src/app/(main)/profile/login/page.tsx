"use client";

import { LoginPageService } from "@/services/page-services.ts/login-page-service";
import { useRouter } from "next/navigation";
import { useRef, useState, useEffect } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { GoogleOAuthProviderWrapper } from "@/components/google-oauth-provider";
import { useUserInfo } from "@/context/user-info-context";
import styles from "./login.module.css";

export default function LoginPage() {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [googleError, setGoogleError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const loginPageServiceRef = useRef<LoginPageService>(new LoginPageService());
  const router = useRouter();
  const { setUserInfo } = useUserInfo();

  useEffect(() => { setMounted(true); }, []);

  if (loginPageServiceRef.current.isLoggedIn()) {
    router.push('/profile');
  }

  const handleLogin = async () => {
    const userInfo = await loginPageServiceRef.current.login(username, password);
    setUserInfo(userInfo);
    router.push('/profile');
  };

  const handleGoogleSuccess = async (credentialResponse: { credential?: string }) => {
    const idToken = credentialResponse.credential;
    if (!idToken) {
      setGoogleError('No credential received from Google');
      return;
    }
    setGoogleError(null);
    try {
      const userInfo = await loginPageServiceRef.current.loginWithGoogle(idToken);
      setUserInfo(userInfo);
      router.push('/profile');
    } catch (err) {
      setGoogleError(err instanceof Error ? err.message : 'Google login failed');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.heading}>
        <div className={styles.logoMark}>
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24 11.47 11.47 0 003.58.57 1 1 0 011 1V21a1 1 0 01-1 1A17 17 0 013 5a1 1 0 011-1h3.5a1 1 0 011 1 11.47 11.47 0 00.57 3.58 1 1 0 01-.25 1.01l-2.2 2.2z" />
          </svg>
        </div>
        <h1>Sign in to BlueCaller</h1>
        <p>Enter your credentials to continue</p>
      </div>

      <div className={styles.card}>
        {googleError && (
          <div className={styles.errorMessage}>
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
            </svg>
            {googleError}
          </div>
        )}

        <div className={styles.fieldGroup}>
          <label className={styles.label}>Username</label>
          <input
            className={styles.input}
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label}>Password</label>
          <input
            className={styles.input}
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button className={styles.loginButton} onClick={handleLogin}>
          Sign in
        </button>

        {mounted && (
          <>
            <div className={styles.divider}>
              <span className={styles.dividerLine} />
              <span className={styles.dividerText}>or</span>
              <span className={styles.dividerLine} />
            </div>

            <div className={styles.googleWrapper}>
              <GoogleOAuthProviderWrapper>
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setGoogleError('Google sign-in failed')}
                  useOneTap={false}
                />
              </GoogleOAuthProviderWrapper>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
