interface FileEntry {
  name: string;
  isDirectory: boolean;
  isFile: boolean;
  size: number;
  modified: Date;
  path: string;
}

interface FileListProps {
  files: FileEntry[];
  selectedFiles: Set<string>;
  currentPath: string;
  onFileClick: (file: FileEntry) => void;
  onFileSelect: (path: string) => void;
  onContextMenu: (e: MouseEvent, file: FileEntry) => void;
}

export default function FileList({
  files,
  selectedFiles,
  currentPath,
  onFileClick,
  onFileSelect,
  onContextMenu,
}: FileListProps) {
  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (date: Date | string) => {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString("zh-CN") + " " + d.toLocaleTimeString("zh-CN");
  };

  // 创建返回上级目录的特殊项
  const createParentDirectoryEntry = (): FileEntry => {
    const parentPath = currentPath.split("/").slice(0, -1).join("/") || "/";
    return {
      name: "...",
      isDirectory: true,
      isFile: false,
      size: 0,
      modified: new Date(),
      path: parentPath,
    };
  };

  // 如果当前路径不是根目录，在文件列表前添加返回上级目录的项
  const displayFiles = currentPath !== "/" ? [createParentDirectoryEntry(), ...files] : files;

  return (
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead class="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th class="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              名称
            </th>
            <th class="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden sm:table-cell">
              大小
            </th>
            <th class="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden md:table-cell">
              修改时间
            </th>
          </tr>
        </thead>
        <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {displayFiles.map((file, index) => {
            const isParentDir = file.name === "..." && currentPath !== "/";
            return (
              <tr
                key={isParentDir ? "parent-directory" : file.path}
                class={`hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${
                  selectedFiles.has(file.path) && !isParentDir
                    ? "bg-blue-50 dark:bg-blue-900"
                    : ""
                }`}
                onClick={() => onFileClick(file)}
                onContextMenu={(e) => {
                  // 不为返回上级目录的项显示右键菜单
                  if (!isParentDir) {
                    onContextMenu(e, file);
                  }
                }}
              >
                <td class="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    {!isParentDir && (
                      <input
                        type="checkbox"
                        checked={selectedFiles.has(file.path)}
                        onClick={(e) => {
                          e.stopPropagation();
                          onFileSelect(file.path);
                        }}
                        class="mr-2 sm:mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    )}
                    <span class="flex items-center min-w-0">
                      {file.isDirectory ? (
                        <svg
                          class={`w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2 flex-shrink-0 ${
                            isParentDir ? "text-blue-500" : "text-yellow-500"
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                        </svg>
                      ) : (
                        <svg
                          class="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2 text-gray-400 flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7.414A2 2 0 0017.414 6L14 2.586A2 2 0 0012.586 2H4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                      <span class={`text-sm font-medium truncate ${
                        isParentDir 
                          ? "text-blue-600 dark:text-blue-400" 
                          : "text-gray-900 dark:text-white"
                      }`}>
                        {file.name}
                      </span>
                    </span>
                  </div>
                </td>
                <td class="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 hidden sm:table-cell">
                  {file.isFile && !isParentDir ? formatSize(file.size) : "-"}
                </td>
                <td class="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 hidden md:table-cell">
                  {!isParentDir ? formatDate(file.modified) : "-"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {files.length === 0 && (
        <div class="text-center py-8 text-gray-500 dark:text-gray-400">
          此目录为空
        </div>
      )}
    </div>
  );
} 