import { Handlers } from "$fresh/server.ts";
import { join, normalize } from "https://deno.land/std@0.224.0/path/mod.ts";
import { ensureDir } from "https://deno.land/std@0.224.0/fs/ensure_dir.ts";
import { getFullPath } from "../../../config.ts";
import { requireAuth } from "../../../auth.ts";

export const handler: Handlers = {
  POST: requireAuth(async (req) => {
    const formData = await req.formData();
    const targetPath = formData.get("path") as string || "/";
    
    // 安全检查
    const normalizedPath = normalize(targetPath);
    if (normalizedPath.includes("..")) {
      return new Response(JSON.stringify({ error: "Invalid path" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const uploadedFiles = [];
    const errors = [];

    try {
      const fullPath = getFullPath(normalizedPath);
      await ensureDir(fullPath);

      // 处理所有上传的文件
      for (const [key, value] of formData.entries()) {
        if (key.startsWith("file") && value instanceof File) {
          try {
            const filePath = join(fullPath, value.name);
            const fileData = await value.arrayBuffer();
            await Deno.writeFile(filePath, new Uint8Array(fileData));
            
            uploadedFiles.push({
              name: value.name,
              size: value.size,
              path: join(normalizedPath, value.name),
            });
          } catch (error) {
            errors.push({
              file: value.name,
              error: error instanceof Error ? error.message : String(error),
            });
          }
        }
      }

      return new Response(JSON.stringify({ 
        success: true,
        uploadedFiles,
        errors,
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