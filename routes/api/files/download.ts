import { Handlers } from "$fresh/server.ts";
import { join, normalize, basename } from "https://deno.land/std@0.224.0/path/mod.ts";
import { getFullPath } from "../../../config.ts";

export const handler: Handlers = {
  async GET(req) {
    const url = new URL(req.url);
    const filePath = url.searchParams.get("path");
    
    if (!filePath) {
      return new Response(JSON.stringify({ error: "Path is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 安全检查
    const normalizedPath = normalize(filePath);
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
        return new Response(JSON.stringify({ error: "Cannot download directory" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      const file = await Deno.open(fullPath, { read: true });
      const fileName = basename(fullPath);
      
      return new Response(file.readable, {
        headers: {
          "Content-Type": "application/octet-stream",
          "Content-Disposition": `attachment; filename="${fileName}"`,
          "Content-Length": stat.size.toString(),
        },
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },
}; 