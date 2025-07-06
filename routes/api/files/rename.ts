import { Handlers } from "$fresh/server.ts";
import { join, normalize, dirname } from "https://deno.land/std@0.224.0/path/mod.ts";
import { getFullPath } from "../../../config.ts";
import { requireAuth } from "../../../auth.ts";

export const handler: Handlers = {
  POST: requireAuth(async (req) => {
    const { oldPath, newName } = await req.json();
    
    // 安全检查
    const normalizedOldPath = normalize(oldPath);
    if (normalizedOldPath.includes("..") || newName.includes("/") || newName.includes("..")) {
      return new Response(JSON.stringify({ error: "Invalid path or name" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    try {
      const fullOldPath = getFullPath(normalizedOldPath);
      const dir = dirname(fullOldPath);
      const fullNewPath = join(dir, newName);
      
      await Deno.rename(fullOldPath, fullNewPath);

      return new Response(JSON.stringify({ 
        success: true,
        newPath: join(dirname(normalizedOldPath), newName)
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