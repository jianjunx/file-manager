import { useEffect, useState } from "preact/hooks";
import { IS_BROWSER } from "$fresh/runtime.ts";
import LoginForm from "../components/LoginForm.tsx";
import FileManager from "./FileManager.tsx";

interface AuthState {
  authEnabled: boolean;
  authenticated: boolean;
  loading: boolean;
}

export default function AuthWrapper() {
  const [authState, setAuthState] = useState<AuthState>({
    authEnabled: true,
    authenticated: false,
    loading: true,
  });
  const [loginError, setLoginError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  // 检查身份验证状态
  useEffect(() => {
    if (IS_BROWSER) {
      checkAuthStatus();
    }
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch("/api/auth/status");
      const data = await response.json();
      setAuthState({
        authEnabled: data.authEnabled,
        authenticated: data.authenticated,
        loading: false,
      });
    } catch (error) {
      console.error("检查身份验证状态失败:", error);
      setAuthState(prev => ({ ...prev, loading: false }));
    }
  };

  const handleLogin = async (username: string, password: string) => {
    setLoggingIn(true);
    setLoginError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setAuthState(prev => ({ ...prev, authenticated: true }));
      } else {
        setLoginError(data.error || "登录失败");
      }
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : "登录失败");
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setAuthState(prev => ({ ...prev, authenticated: false }));
    } catch (error) {
      console.error("登出失败:", error);
    }
  };

  // 加载中状态
  if (authState.loading) {
    return (
      <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div class="text-center">
          <svg class="animate-spin h-12 w-12 text-indigo-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p class="text-gray-600 dark:text-gray-400">加载中...</p>
        </div>
      </div>
    );
  }

  // 如果未启用身份验证或已认证，显示文件管理器
  if (!authState.authEnabled || authState.authenticated) {
    return <FileManager onLogout={authState.authEnabled ? handleLogout : undefined} />;
  }

  // 显示登录页面
  return (
    <LoginForm
      onLogin={handleLogin}
      error={loginError}
      loading={loggingIn}
    />
  );
} 