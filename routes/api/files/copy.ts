import { Handlers } from "$fresh/server.ts";
import { join, normalize } from "https://deno.land/std@0.224.0/path/mod.ts";
import { copy } from "https://deno.land/std@0.224.0/fs/copy.ts";
import { getFullPath } from "../../../config.ts";
import { requireAuth } from "../../../auth.ts";

export const handler: Handlers = {
  POST: requireAuth(async (req) => {
    const { sourcePath, targetPath } = await req.json();
    
    // 安全检查
    const normalizedSourcePath = normalize(sourcePath);
    const normalizedTargetPath = normalize(targetPath);
    
    if (normalizedSourcePath.includes("..") || normalizedTargetPath.includes("..")) {
      return new Response(JSON.stringify({ error: "Invalid path" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    try {
      const fullSourcePath = getFullPath(normalizedSourcePath);
      const fullTargetPath = getFullPath(normalizedTargetPath);
      
      await copy(fullSourcePath, fullTargetPath, { overwrite: false });

      return new Response(JSON.stringify({ 
        success: true,
        newPath: normalizedTargetPath
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