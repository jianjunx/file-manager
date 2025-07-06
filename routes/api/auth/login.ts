import { Handlers } from "$fresh/server.ts";
import { verifyCredentials, createSession, createSessionCookie } from "../../../auth.ts";

export const handler: Handlers = {
  async POST(req) {
    try {
      const { username, password } = await req.json();
      
      if (!username || !password) {
        return new Response(JSON.stringify({ 
          error: "用户名和密码不能为空" 
        }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }
      
      // 验证用户名密码
      if (!verifyCredentials(username, password)) {
        return new Response(JSON.stringify({ 
          error: "用户名或密码错误" 
        }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }
      
      // 创建session
      const sessionId = createSession(username);
      
      // 返回成功响应并设置cookie
      return createSessionCookie(sessionId);
      
    } catch (error) {
      return new Response(JSON.stringify({ 
        error: error instanceof Error ? error.message : String(error) 
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },
}; 