import { useEffect, useRef } from "preact/hooks";
import { JSX } from "preact";
// @deno-types="npm:@types/node"
import Player from "xgplayer";

interface VideoPlayerProps {
  videoUrl: string;
  onClose: () => void;
  className?: string;
}

export default function VideoPlayer({ videoUrl, onClose, className = "" }: VideoPlayerProps) {
  const playerRef = useRef<HTMLDivElement>(null);
  const playerInstanceRef = useRef<Player | null>(null);

  useEffect(() => {
    if (playerRef.current) {
      // 清理之前的播放器实例
      if (playerInstanceRef.current) {
        playerInstanceRef.current.destroy();
      }

      // 创建新的播放器实例
      playerInstanceRef.current = new Player({
        el: playerRef.current,
        url: videoUrl,
        width: "100%",
        height: "100%",
        autoplay: false,
        loop: false,
        volume: 0.8,
        playbackRate: [0.5, 0.75, 1, 1.25, 1.5, 2],
        download: true,
        pip: true,
        screenshot: true,
        playsinline: true,
        whitelist: [],
        plugins: [],
        controls: {
          initShow: true,
          mode: "normal"
        },
        lang: "zh-cn"
      });

      // 监听播放器事件
      playerInstanceRef.current.on('error', (err: any) => {
        console.error('播放器错误:', err);
        alert('视频播放失败，请检查文件格式或网络连接');
      });

      playerInstanceRef.current.on('loadstart', () => {
        console.log('开始加载视频');
      });

      playerInstanceRef.current.on('canplay', () => {
        console.log('视频可以播放');
      });
    }

    // 清理函数
    return () => {
      if (playerInstanceRef.current) {
        playerInstanceRef.current.destroy();
        playerInstanceRef.current = null;
      }
    };
  }, [videoUrl]);

  const handleBackdropClick = (e: JSX.TargetedMouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div class={`relative bg-black rounded-lg max-w-5xl max-h-[90vh] w-full mx-4 ${className}`}>
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          class="absolute top-4 right-4 z-10 text-white hover:text-gray-300 transition-colors"
        >
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        {/* 视频播放器容器 */}
        <div 
          ref={playerRef}
          class="w-full h-96 md:h-[500px] lg:h-[600px]"
          style={{ minHeight: "300px" }}
        />
      </div>
    </div>
  );
} 