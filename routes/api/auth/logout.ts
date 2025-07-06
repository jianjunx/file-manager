import { Handlers } from "$fresh/server.ts";
import { getSessionFromRequest, deleteSession, createLogoutResponse } from "../../../auth.ts";

export const handler: Handlers = {
  async POST(req) {
    try {
      // 获取并删除session
      const sessionId = getSessionFromRequest(req);
      if (sessionId) {
        deleteSession(sessionId);
      }
      
      // 返回成功响应并删除cookie
      return createLogoutResponse();
      
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