import { useState } from "preact/hooks";

interface LoginFormProps {
  onLogin: (username: string, password: string) => void;
  error?: string;
  loading?: boolean;
}

export default function LoginForm({ onLogin, error, loading }: LoginFormProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    if (username && password) {
      onLogin(username, password);
    }
  };

  return (
    <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8">
        <div>
          <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            文件管理器登录
          </h2>
          <p class="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            请输入账号密码以访问文件管理器
          </p>
        </div>
        <form class="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div class="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username" class="sr-only">
                用户名
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white dark:bg-gray-800 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="用户名"
                value={username}
                onInput={(e) => setUsername((e.target as HTMLInputElement).value)}
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="password" class="sr-only">
                密码
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white dark:bg-gray-800 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="密码"
                value={password}
                onInput={(e) => setPassword((e.target as HTMLInputElement).value)}
                disabled={loading}
              />
            </div>
          </div>

          {error && (
            <div class="rounded-md bg-red-50 dark:bg-red-900 p-4">
              <div class="text-sm text-red-700 dark:text-red-200">
                {error}
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading || !username || !password}
              class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span class="flex items-center">
                  <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  登录中...
                </span>
              ) : (
                "登录"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 