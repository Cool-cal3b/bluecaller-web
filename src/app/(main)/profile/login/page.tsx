"use client";

import { LoginPageService } from "@/services/page-services.ts/login-page-service";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { GoogleLogin } from "@react-oauth/google";

export default function LoginPage() {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [googleError, setGoogleError] = useState<string | null>(null);
  const loginPageServiceRef = useRef<LoginPageService>(new LoginPageService());
  const router = useRouter();

  if (loginPageServiceRef.current.isLoggedIn()) {
    router.push('/profile');
  }

  const handleLogin = async () => {
    await loginPageServiceRef.current.login(username, password);
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
      await loginPageServiceRef.current.loginWithGoogle(idToken);
      router.push('/profile');
    } catch (err) {
      setGoogleError(err instanceof Error ? err.message : 'Google login failed');
    }
  };

  return (
    <div>
      <h1>Login</h1>
      <div>
        <div>Username</div>
        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
        <div>Password</div>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button onClick={handleLogin}>Login</button>

        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => setGoogleError('Google sign-in failed')}
          useOneTap={false}
        />
        {googleError && <div>{googleError}</div>}
      </div>
    </div>
  );
}