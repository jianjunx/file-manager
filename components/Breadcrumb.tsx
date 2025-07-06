interface BreadcrumbProps {
  path: string;
  onNavigate: (path: string) => void;
}

export default function Breadcrumb({ path, onNavigate }: BreadcrumbProps) {
  const parts = path.split("/").filter(Boolean);
  
  // 在移动端只显示最后两级
  const isMobile = typeof window !== "undefined" && window.innerWidth < 640;
  const displayParts = isMobile && parts.length > 2 
    ? ["...", ...parts.slice(-2)]
    : parts;
  
  return (
    <nav class="flex" aria-label="Breadcrumb">
      <ol class="inline-flex items-center space-x-1 md:space-x-3">
        <li class="inline-flex items-center">
          <button
            onClick={() => onNavigate("/")}
            class="inline-flex items-center text-xs sm:text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white"
          >
            <svg
              class="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            <span class="hidden sm:inline">根目录</span>
            <span class="sm:hidden">/</span>
          </button>
        </li>
        
        {displayParts.map((part, index) => {
          const isEllipsis = part === "...";
          const actualIndex = isMobile && parts.length > 2 && index > 0 
            ? parts.length - (displayParts.length - index)
            : index;
          const pathUpTo = isEllipsis ? path : "/" + parts.slice(0, actualIndex + 1).join("/");
          
          return (
            <li key={index}>
              <div class="flex items-center">
                <svg
                  class="w-3 h-3 mx-1 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 12 12"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 1l4 5-4 5"
                  />
                </svg>
                {isEllipsis ? (
                  <span class="ml-1 text-xs sm:text-sm text-gray-400">...</span>
                ) : (
                  <button
                    onClick={() => onNavigate(pathUpTo)}
                    class="ml-1 text-xs sm:text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2 dark:text-gray-400 dark:hover:text-white truncate max-w-[100px] sm:max-w-none"
                  >
                    {part}
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
} 