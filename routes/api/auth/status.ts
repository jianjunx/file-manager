import { Handlers } from "$fresh/server.ts";
import { isAuthenticated } from "../../../auth.ts";
import { getConfig } from "../../../config.ts";

export const handler: Handlers = {
  async GET(req) {
    try {
      const config = getConfig();
      
      const response = {
        authEnabled: config.auth.enabled,
        authenticated: isAuthenticated(req),
      };
      
      return new Response(JSON.stringify(response), {
        headers: { "Content-Type": "application/json" },
      });
      
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