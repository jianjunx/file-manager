import { useState, useRef } from "preact/hooks";

interface UploadFile {
  file: File;
  progress: number;
  status: "pending" | "uploading" | "done" | "error";
  error?: string;
}

interface UploadModalProps {
  currentPath: string;
  onClose: () => void;
  onUploadComplete: () => void;
}

export default function UploadModal({
  currentPath,
  onClose,
  onUploadComplete,
}: UploadModalProps) {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: Event) => {
    const input = e.target as HTMLInputElement;
    if (input.files) {
      addFiles(input.files);
    }
  };

  const addFiles = (fileList: FileList) => {
    const newFiles = Array.from(fileList).map((file) => ({
      file,
      progress: 0,
      status: "pending" as const,
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer?.files) {
      addFiles(e.dataTransfer.files);
    }
  };

  const uploadFile = async (uploadFile: UploadFile, index: number) => {
    setFiles((prev) => {
      const updated = [...prev];
      updated[index] = { ...uploadFile, status: "uploading" };
      return updated;
    });

    const formData = new FormData();
    formData.append("path", currentPath);
    formData.append("file", uploadFile.file);

    try {
      // 使用 XMLHttpRequest 来跟踪上传进度
      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const progress = (e.loaded / e.total) * 100;
            setFiles((prev) => {
              const updated = [...prev];
              updated[index] = { ...updated[index], progress };
              return updated;
            });
          }
        };

        xhr.onload = () => {
          if (xhr.status === 200) {
            resolve(xhr.response);
          } else {
            reject(new Error(`Upload failed: ${xhr.statusText}`));
          }
        };

        xhr.onerror = () => reject(new Error("Network error"));

        xhr.open("POST", "/api/files/upload");
        xhr.send(formData);
      });

      setFiles((prev) => {
        const updated = [...prev];
        updated[index] = { ...uploadFile, status: "done", progress: 100 };
        return updated;
      });
    } catch (error) {
      setFiles((prev) => {
        const updated = [...prev];
        updated[index] = {
          ...uploadFile,
          status: "error",
          error: error.message,
        };
        return updated;
      });
    }
  };

  const handleUpload = async () => {
    setUploading(true);
    
    // 上传所有待上传的文件
    const pendingFiles = files.filter((f) => f.status === "pending");
    await Promise.all(
      pendingFiles.map((file, index) => uploadFile(file, index))
    );

    setUploading(false);
    
    // 如果所有文件都上传成功，关闭模态框
    if (files.every((f) => f.status === "done")) {
      onUploadComplete();
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[80vh] flex flex-col">
        <div class="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white">
            上传文件到: {currentPath}
          </h3>
        </div>

        <div class="p-6 flex-1 overflow-y-auto">
          <div 
            class={`mb-4 border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging 
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" 
                : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              class="hidden"
            />
            <svg
              class="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <button
              onClick={() => fileInputRef.current?.click()}
              class="mt-4 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              点击选择文件
            </button>
            <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
              或将文件拖拽到此处
            </p>
          </div>

          {files.length > 0 && (
            <div class="space-y-2">
              {files.map((file, index) => (
                <div
                  key={index}
                  class="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                >
                  <div class="flex items-center justify-between mb-2">
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {file.file.name}
                      </p>
                      <p class="text-sm text-gray-500 dark:text-gray-400">
                        {formatSize(file.file.size)}
                      </p>
                    </div>
                    {file.status === "pending" && (
                      <button
                        onClick={() => removeFile(index)}
                        class="ml-2 text-red-600 hover:text-red-800"
                      >
                        删除
                      </button>
                    )}
                  </div>

                  {file.status !== "pending" && (
                    <div class="mt-2">
                      <div class="flex items-center justify-between text-sm mb-1">
                        <span
                          class={
                            file.status === "done"
                              ? "text-green-600"
                              : file.status === "error"
                              ? "text-red-600"
                              : "text-blue-600"
                          }
                        >
                          {file.status === "done"
                            ? "上传完成"
                            : file.status === "error"
                            ? `错误: ${file.error}`
                            : "上传中..."}
                        </span>
                        <span>{Math.round(file.progress)}%</span>
                      </div>
                      <div class="w-full bg-gray-200 rounded-full h-2">
                        <div
                          class={`h-2 rounded-full transition-all ${
                            file.status === "done"
                              ? "bg-green-600"
                              : file.status === "error"
                              ? "bg-red-600"
                              : "bg-blue-600"
                          }`}
                          style={{ width: `${file.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div class="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
          <button
            onClick={onClose}
            class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-500"
            disabled={uploading}
          >
            取消
          </button>
          <button
            onClick={handleUpload}
            disabled={files.length === 0 || uploading}
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? "上传中..." : "开始上传"}
          </button>
        </div>
      </div>
    </div>
  );
} 