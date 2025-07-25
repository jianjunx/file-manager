import { Handlers } from "$fresh/server.ts";
import { join, normalize, extname } from "https://deno.land/std@0.224.0/path/mod.ts";
import { getFullPath } from "../../../config.ts";
import { requireAuth } from "../../../auth.ts";

// MIME类型映射
const mimeTypes: Record<string, string> = {
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.ogg': 'video/ogg',
  '.avi': 'video/x-msvideo',
  '.mov': 'video/quicktime',
  '.wmv': 'video/x-ms-wmv',
  '.flv': 'video/x-flv',
  '.mkv': 'video/x-matroska',
};

function getMimeType(fileName: string): string {
  const ext = extname(fileName).toLowerCase();
  return mimeTypes[ext] || 'application/octet-stream';
}

export const handler: Handlers = {
  GET: requireAuth(async (req) => {
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
        return new Response(JSON.stringify({ error: "Cannot stream directory" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      const fileName = fullPath.split('/').pop() || '';
      const mimeType = getMimeType(fileName);
      const fileSize = stat.size;

      // 处理Range请求（用于视频流）
      const range = req.headers.get('range');
      
      if (range) {
        // 解析Range头部
        const rangeMatch = range.match(/bytes=(\d+)-(\d*)/);
        if (!rangeMatch) {
          return new Response("Invalid range", { status: 416 });
        }

        const start = parseInt(rangeMatch[1], 10);
        const end = rangeMatch[2] ? parseInt(rangeMatch[2], 10) : fileSize - 1;
        const chunkSize = end - start + 1;

        if (start >= fileSize || end >= fileSize || start > end) {
          return new Response("Range not satisfiable", { 
            status: 416,
            headers: {
              'Content-Range': `bytes */${fileSize}`
            }
          });
        }

        // 打开文件并seek到指定位置
        const file = await Deno.open(fullPath, { read: true });
        await file.seek(start, Deno.SeekMode.Start);
        
        // 创建一个可读流，只读取指定范围的数据
        const reader = file.readable.getReader();
        let bytesRead = 0;
        
        const stream = new ReadableStream({
          async start(controller) {
            try {
              while (bytesRead < chunkSize) {
                const { done, value } = await reader.read();
                if (done) break;
                
                const remainingBytes = chunkSize - bytesRead;
                const chunkToSend = remainingBytes < value.length 
                  ? value.slice(0, remainingBytes) 
                  : value;
                
                controller.enqueue(chunkToSend);
                bytesRead += chunkToSend.length;
                
                if (bytesRead >= chunkSize) break;
              }
              controller.close();
            } catch (error) {
              controller.error(error);
            } finally {
              file.close();
            }
          }
        });

        return new Response(stream, {
          status: 206,
          headers: {
            'Content-Type': mimeType,
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunkSize.toString(),
            'Cache-Control': 'no-cache',
          },
        });
      } else {
        // 正常的全文件请求
        const file = await Deno.open(fullPath, { read: true });
        
        return new Response(file.readable, {
          headers: {
            'Content-Type': mimeType,
            'Content-Length': fileSize.toString(),
            'Accept-Ranges': 'bytes',
            'Cache-Control': 'no-cache',
          },
        });
      }
    } catch (error) {
      return new Response(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }),
}; 