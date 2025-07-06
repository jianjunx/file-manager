import { useState, useEffect } from "preact/hooks";

interface DirectoryEntry {
  name: string;
  path: string;
}

interface DirectorySelectorProps {
  currentPath: string;
  onSelect: (path: string) => void;
  onClose: () => void;
  title: string;
}

export default function DirectorySelector({
  currentPath,
  onSelect,
  onClose,
  title,
}: DirectorySelectorProps) {
  const [selectedPath, setSelectedPath] = useState(currentPath);
  const [directories, setDirectories] = useState<DirectoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDirectories(selectedPath);
  }, [selectedPath]);

  const loadDirectories = async (path: string) => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/files/list?path=${encodeURIComponent(path)}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to load directories");
      }
      
      // 只显示目录
      const dirs = data.entries.filter((entry: any) => entry.isDirectory);
      setDirectories(dirs);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const navigateUp = () => {
    const parentPath = selectedPath.split("/").slice(0, -1).join("/") || "/";
    setSelectedPath(parentPath);
  };

  const navigateToPath = (path: string) => {
    setSelectedPath(path);
  };

  const handleSelect = () => {
    onSelect(selectedPath);
    onClose();
  };

  return (
    <div class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[80vh] flex flex-col">
        <div class="p-6 border-b border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">
              {title}
            </h3>
            <button
              onClick={onClose}
              class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div class="p-6 flex-1 overflow-y-auto">
          <div class="mb-4">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
                当前目录: {selectedPath}
              </span>
              {selectedPath !== "/" && (
                <button
                  onClick={navigateUp}
                  class="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  返回上级
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <div class="text-center py-8">
              <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
            </div>
          ) : error ? (
            <div class="text-center py-8 text-red-600">{error}</div>
          ) : (
            <div class="space-y-2">
              {directories.length === 0 ? (
                <div class="text-center py-8 text-gray-500 dark:text-gray-400">
                  此目录中没有子目录
                </div>
              ) : (
                directories.map((dir) => (
                  <button
                    key={dir.path}
                    onClick={() => navigateToPath(dir.path)}
                    class="w-full flex items-center p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <svg
                      class="w-5 h-5 mr-3 text-yellow-500 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                    </svg>
                    <span class="text-sm font-medium text-gray-900 dark:text-white">
                      {dir.name}
                    </span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        <div class="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
          <button
            onClick={onClose}
            class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-500"
          >
            取消
          </button>
          <button
            onClick={handleSelect}
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            选择此目录
          </button>
        </div>
      </div>
    </div>
  );
} 