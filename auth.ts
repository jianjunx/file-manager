import { getConfig } from "./config.ts";
import { getCookies, setCookie, deleteCookie } from "https://deno.land/std@0.224.0/http/cookie.ts";

const COOKIE_NAME = "file_manager_session";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7天

// 简单的session存储（内存中）
const sessions = new Map<string, { username: string; timestamp: number }>();

// 生成session ID
function generateSessionId(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// 验证用户名密码
export function verifyCredentials(username: string, password: string): boolean {
  const config = getConfig();
  if (!config.auth.enabled) {
    return true; // 如果未启用身份验证，直接通过
  }
  return username === config.auth.username && password === config.auth.password;
}

// 创建session
export function createSession(username: string): string {
  const sessionId = generateSessionId();
  sessions.set(sessionId, {
    username,
    timestamp: Date.now(),
  });
  return sessionId;
}

// 验证session
export function verifySession(sessionId: string): boolean {
  const session = sessions.get(sessionId);
  if (!session) return false;
  
  // 检查session是否过期（7天）
  const now = Date.now();
  if (now - session.timestamp > COOKIE_MAX_AGE * 1000) {
    sessions.delete(sessionId);
    return false;
  }
  
  // 更新时间戳
  session.timestamp = now;
  return true;
}

// 删除session
export function deleteSession(sessionId: string): void {
  sessions.delete(sessionId);
}

// 从请求中获取session ID
export function getSessionFromRequest(request: Request): string | null {
  const cookies = getCookies(request.headers);
  return cookies[COOKIE_NAME] || null;
}

// 检查请求是否已认证
export function isAuthenticated(request: Request): boolean {
  const config = getConfig();
  if (!config.auth.enabled) {
    return true; // 如果未启用身份验证，直接通过
  }
  
  const sessionId = getSessionFromRequest(request);
  if (!sessionId) return false;
  
  return verifySession(sessionId);
}

// 创建设置cookie的响应头
export function createSessionCookie(sessionId: string): Response {
  const response = new Response(JSON.stringify({ success: true }), {
    headers: { "Content-Type": "application/json" },
  });
  
  setCookie(response.headers, {
    name: COOKIE_NAME,
    value: sessionId,
    maxAge: COOKIE_MAX_AGE,
    httpOnly: true,
    secure: false, // 在开发环境中设为false，生产环境应该为true
    sameSite: "Strict",
    path: "/",
  });
  
  return response;
}

// 创建删除cookie的响应头
export function createLogoutResponse(): Response {
  const response = new Response(JSON.stringify({ success: true }), {
    headers: { "Content-Type": "application/json" },
  });
  
  deleteCookie(response.headers, COOKIE_NAME, { path: "/" });
  return response;
}

// 身份验证中间件
export function requireAuth(handler: (req: Request) => Response | Promise<Response>) {
  return async (req: Request): Promise<Response> => {
    const config = getConfig();
    
    // 如果未启用身份验证，直接调用原始处理器
    if (!config.auth.enabled) {
      return await handler(req);
    }
    
    // 检查身份验证
    if (!isAuthenticated(req)) {
      return new Response(JSON.stringify({ 
        error: "Unauthorized", 
        needAuth: true 
      }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    
    return await handler(req);
  };
} 