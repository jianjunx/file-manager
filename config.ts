import { join, resolve } from "https://deno.land/std@0.224.0/path/mod.ts";

export interface Config {
  rootPath: string;
  port: number;
  auth: {
    enabled: boolean;
    username: string;
    password: string;
    sessionSecret: string;
  };
}

export function getConfig(): Config {
  // Docker部署时使用/data目录，本地开发时使用./data目录
  const isDocker = isRunningInDocker();
  const defaultPath = isDocker ? "/data" : join(Deno.cwd(), "data");
  const rootPath = Deno.env.get("FILE_MANAGER_ROOT") || defaultPath;
  
  // 从环境变量获取端口，默认为8000
  const port = parseInt(Deno.env.get("PORT") || "8000");
  
  // 身份验证配置
  const username = Deno.env.get("AUTH_USERNAME");
  const password = Deno.env.get("AUTH_PASSWORD");
  const authEnabled = !!(username && password);
  
  // Session密钥，如果未设置则生成一个随机密钥
  const sessionSecret = Deno.env.get("SESSION_SECRET") || generateRandomSecret();
  
  return {
    rootPath: resolve(rootPath),
    port,
    auth: {
      enabled: authEnabled,
      username: username || "",
      password: password || "",
      sessionSecret,
    },
  };
}

// 生成随机session密钥
function generateRandomSecret(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// 检测是否在Docker容器中运行
function isRunningInDocker(): boolean {
  try {
    // 检查是否存在/.dockerenv文件
    Deno.statSync("/.dockerenv");
    return true;
  } catch {
    // 检查/proc/1/cgroup是否包含docker
    try {
      const text = Deno.readTextFileSync("/proc/1/cgroup");
      return text.includes("docker") || text.includes("containerd");
    } catch {
      return false;
    }
  }
}

export function getFullPath(relativePath: string): string {
  const config = getConfig();
  return join(config.rootPath, relativePath);
} 