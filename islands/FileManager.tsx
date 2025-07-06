import { useEffect, useState } from "preact/hooks";
import { IS_BROWSER } from "$fresh/runtime.ts";
import FileList from "../components/FileList.tsx";
import UploadModal from "../components/UploadModal.tsx";
import Breadcrumb from "../components/Breadcrumb.tsx";
import ContextMenu from "../components/ContextMenu.tsx";
import DirectorySelector from "../components/DirectorySelector.tsx";

interface FileEntry {
  name: string;
  isDirectory: boolean;
  isFile: boolean;
  size: number;
  modified: Date;
  path: string;
}

interface FileManagerProps {
  onLogout?: () => void;
}

export default function FileManager({ onLogout }: FileManagerProps) {
  const [currentPath, setCurrentPath] = useState("/");
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDirectorySelector, setShowDirectorySelector] = useState(false);
  const [directorySelectorTitle, setDirectorySelectorTitle] = useState("");
  const [pendingOperation, setPendingOperation] = useState<{
    type: "move" | "copy";
    files: string[];
  } | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    file: FileEntry | null;
  } | null>(null);

  useEffect(() => {
    if (IS_BROWSER) {
      loadFiles(currentPath);
    }
  }, [currentPath]);

  const loadFiles = async (path: string) => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/files/list?path=${encodeURIComponent(path)}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to load files");
      }
      
      setFiles(data.entries);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleFileClick = (file: FileEntry) => {
    if (file.isDirectory) {
      setCurrentPath(file.path);
      setSelectedFiles(new Set());
    }
  };

  const handleDelete = async (paths: string[]) => {
    if (!confirm(`确定要删除 ${paths.length} 个项目吗？`)) return;

    try {
      for (const path of paths) {
        const response = await fetch("/api/files/delete", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to delete");
        }
      }
      loadFiles(currentPath);
      setSelectedFiles(new Set());
    } catch (err) {
      alert(`删除失败: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const handleMove = (files: string[]) => {
    setPendingOperation({ type: "move", files });
    setDirectorySelectorTitle("移动到目录");
    setShowDirectorySelector(true);
  };

  const handleCopy = (files: string[]) => {
    setPendingOperation({ type: "copy", files });
    setDirectorySelectorTitle("复制到目录");
    setShowDirectorySelector(true);
  };

  const handleDirectorySelect = async (targetPath: string) => {
    if (!pendingOperation) return;

    try {
      const { type, files } = pendingOperation;
      
      for (const filePath of files) {
        const fileName = filePath.split("/").pop();
        const newPath = `${targetPath}/${fileName}`;
        
        if (type === "move") {
          const response = await fetch("/api/files/move", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sourcePath: filePath, targetPath: newPath }),
          });

          if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || "Failed to move");
          }
        } else if (type === "copy") {
          const response = await fetch("/api/files/copy", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sourcePath: filePath, targetPath: newPath }),
          });

          if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || "Failed to copy");
          }
        }
      }

      loadFiles(currentPath);
      setSelectedFiles(new Set());
      setPendingOperation(null);
      alert(`${type === "move" ? "移动" : "复制"}成功！`);
    } catch (err) {
      alert(`操作失败: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const handleDownload = (file: FileEntry) => {
    if (file.isFile) {
      const downloadUrl = `/api/files/download?path=${encodeURIComponent(file.path)}`;
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const handleRename = async (file: FileEntry) => {
    const newName = prompt("输入新名称:", file.name);
    if (!newName || newName === file.name) return;

    try {
      const response = await fetch("/api/files/rename", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPath: file.path, newName }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to rename");
      }

      loadFiles(currentPath);
    } catch (err) {
      alert(`重命名失败: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const handleCreateFolder = async () => {
    const name = prompt("输入文件夹名称:");
    if (!name) return;

    try {
      const response = await fetch("/api/files/create-dir", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: currentPath, name }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create directory");
      }

      loadFiles(currentPath);
    } catch (err) {
      alert(`创建文件夹失败: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const handleUploadComplete = () => {
    loadFiles(currentPath);
    setShowUploadModal(false);
  };

  const selectedFilesArray = Array.from(selectedFiles);

  return (
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div class="p-4 border-b border-gray-200 dark:border-gray-700">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <Breadcrumb path={currentPath} onNavigate={setCurrentPath} />
              
              <div class="flex flex-wrap gap-2">
                <button
                  onClick={handleCreateFolder}
                  class="px-3 py-2 text-sm sm:px-4 sm:text-base bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <span class="hidden sm:inline">新建文件夹</span>
                  <span class="sm:hidden">新建</span>
                </button>
                <button
                  onClick={() => setShowUploadModal(true)}
                  class="px-3 py-2 text-sm sm:px-4 sm:text-base bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  <span class="hidden sm:inline">上传文件</span>
                  <span class="sm:hidden">上传</span>
                </button>
                {selectedFiles.size > 0 && (
                  <>
                    <button
                      onClick={() => handleMove(selectedFilesArray)}
                      class="px-3 py-2 text-sm sm:px-4 sm:text-base bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                    >
                      <span class="hidden sm:inline">移动选中</span>
                      <span class="sm:hidden">移动</span>
                    </button>
                    <button
                      onClick={() => handleCopy(selectedFilesArray)}
                      class="px-3 py-2 text-sm sm:px-4 sm:text-base bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
                    >
                      <span class="hidden sm:inline">复制选中</span>
                      <span class="sm:hidden">复制</span>
                    </button>
                    <button
                      onClick={() => handleDelete(selectedFilesArray)}
                      class="px-3 py-2 text-sm sm:px-4 sm:text-base bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                    >
                      <span class="hidden sm:inline">删除选中 ({selectedFiles.size})</span>
                      <span class="sm:hidden">删除 ({selectedFiles.size})</span>
                    </button>
                  </>
                )}
                {onLogout && (
                  <button
                    onClick={onLogout}
                    class="px-3 py-2 text-sm sm:px-4 sm:text-base bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                  >
                    <span class="hidden sm:inline">登出</span>
                    <span class="sm:hidden">退出</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          <div class="p-2 sm:p-4">
            {loading ? (
              <div class="text-center py-8">
                <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
              </div>
            ) : error ? (
              <div class="text-center py-8 text-red-600">{error}</div>
            ) : (
              <FileList
                files={files}
                selectedFiles={selectedFiles}
                currentPath={currentPath}
                onFileClick={handleFileClick}
                onFileSelect={(path) => {
                  const newSelected = new Set(selectedFiles);
                  if (newSelected.has(path)) {
                    newSelected.delete(path);
                  } else {
                    newSelected.add(path);
                  }
                  setSelectedFiles(newSelected);
                }}
                onContextMenu={(e, file) => {
                  e.preventDefault();
                  setContextMenu({ x: e.clientX, y: e.clientY, file });
                }}
              />
            )}
          </div>
        </div>
      </div>

      {showUploadModal && (
        <UploadModal
          currentPath={currentPath}
          onClose={() => setShowUploadModal(false)}
          onUploadComplete={handleUploadComplete}
        />
      )}

      {showDirectorySelector && (
        <DirectorySelector
          currentPath={currentPath}
          title={directorySelectorTitle}
          onSelect={handleDirectorySelect}
          onClose={() => {
            setShowDirectorySelector(false);
            setPendingOperation(null);
          }}
        />
      )}

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          file={contextMenu.file}
          onClose={() => setContextMenu(null)}
          onRename={() => {
            if (contextMenu.file) {
              handleRename(contextMenu.file);
            }
            setContextMenu(null);
          }}
          onDelete={() => {
            if (contextMenu.file) {
              handleDelete([contextMenu.file.path]);
            }
            setContextMenu(null);
          }}
          onDownload={() => {
            if (contextMenu.file) {
              handleDownload(contextMenu.file);
            }
            setContextMenu(null);
          }}
          onMove={() => {
            if (contextMenu.file) {
              handleMove([contextMenu.file.path]);
            }
            setContextMenu(null);
          }}
          onCopy={() => {
            if (contextMenu.file) {
              handleCopy([contextMenu.file.path]);
            }
            setContextMenu(null);
          }}
        />
      )}
    </div>
  );
} 