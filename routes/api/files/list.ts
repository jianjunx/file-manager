import { Handlers } from "$fresh/server.ts";
import { join, normalize } from "https://deno.land/std@0.224.0/path/mod.ts";
import { getFullPath } from "../../../config.ts";
import { requireAuth } from "../../../auth.ts";

export const handler: Handlers = {
  GET: requireAuth(async (req) => {
    const url = new URL(req.url);
    const path = url.searchParams.get("path") || "/";
    
    // 安全检查：防止路径遍历攻击
    const normalizedPath = normalize(path);
    if (normalizedPath.includes("..")) {
      return new Response(JSON.stringify({ error: "Invalid path" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    try {
      const fullPath = getFullPath(normalizedPath);
      const entries = [];
      
      for await (const entry of Deno.readDir(fullPath)) {
        const stat = await Deno.stat(join(fullPath, entry.name));
        entries.push({
          name: entry.name,
          isDirectory: entry.isDirectory,
          isFile: entry.isFile,
          size: stat.size,
          modified: stat.mtime,
          path: join(normalizedPath, entry.name),
        });
      }

      // 排序：目录在前，文件在后
      entries.sort((a, b) => {
        if (a.isDirectory && !b.isDirectory) return -1;
        if (!a.isDirectory && b.isDirectory) return 1;
        return a.name.localeCompare(b.name);
      });

      return new Response(JSON.stringify({ 
        path: normalizedPath,
        entries 
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