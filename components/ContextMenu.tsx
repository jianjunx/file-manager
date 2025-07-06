import { useEffect } from "preact/hooks";

interface FileEntry {
  name: string;
  isDirectory: boolean;
  isFile: boolean;
  size: number;
  modified: Date;
  path: string;
}

interface ContextMenuProps {
  x: number;
  y: number;
  file: FileEntry | null;
  onClose: () => void;
  onRename: () => void;
  onDelete: () => void;
  onDownload?: () => void;
  onMove?: () => void;
  onCopy?: () => void;
}

export default function ContextMenu({
  x,
  y,
  file,
  onClose,
  onRename,
  onDelete,
  onDownload,
  onMove,
  onCopy,
}: ContextMenuProps) {
  useEffect(() => {
    const handleClick = () => onClose();
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [onClose]);

  if (!file) return null;

  return (
    <div
      class="fixed z-50 bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5"
      style={{
        top: `${y}px`,
        left: `${x}px`,
      }}
    >
      <div class="py-1">
        {file.isFile && onDownload && (
          <button
            onClick={onDownload}
            class="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            下载
          </button>
        )}
        {onMove && (
          <button
            onClick={onMove}
            class="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            移动到...
          </button>
        )}
        {onCopy && (
          <button
            onClick={onCopy}
            class="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            复制到...
          </button>
        )}
        <button
          onClick={onRename}
          class="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          重命名
        </button>
        <button
          onClick={onDelete}
          class="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          删除
        </button>
      </div>
    </div>
  );
} 