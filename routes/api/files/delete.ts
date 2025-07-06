import { Handlers } from "$fresh/server.ts";
import { join, normalize } from "https://deno.land/std@0.224.0/path/mod.ts";
import { getFullPath } from "../../../config.ts";
import { requireAuth } from "../../../auth.ts";

export const handler: Handlers = {
  DELETE: requireAuth(async (req) => {
    const { path } = await req.json();
    
    // 安全检查
    const normalizedPath = normalize(path);
    if (normalizedPath.includes("..")) {
      return new Response(JSON.stringify({ error: "Invalid path" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    try {
      const fullPath = getFullPath(normalizedPath);
      const stat = await Deno.stat(fullPath);
      
      if (stat.isDirectory) {
        // 递归删除目录
        await Deno.remove(fullPath, { recursive: true });
      } else {
        await Deno.remove(fullPath);
      }

      return new Response(JSON.stringify({ success: true }), {
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