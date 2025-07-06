import { Handlers } from "$fresh/server.ts";
import { join, normalize } from "https://deno.land/std@0.224.0/path/mod.ts";
import { getFullPath } from "../../../config.ts";
import { requireAuth } from "../../../auth.ts";

export const handler: Handlers = {
  POST: requireAuth(async (req) => {
    const { path, name } = await req.json();
    
    // 安全检查
    const normalizedPath = normalize(path);
    if (normalizedPath.includes("..") || name.includes("/") || name.includes("..")) {
      return new Response(JSON.stringify({ error: "Invalid path or name" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    try {
      const fullPath = getFullPath(join(normalizedPath, name));
      await Deno.mkdir(fullPath, { recursive: true });

      return new Response(JSON.stringify({ 
        success: true,
        path: join(normalizedPath, name)
      }), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }),
}; 