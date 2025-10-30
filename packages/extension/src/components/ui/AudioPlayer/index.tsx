import React, { useRef, useEffect } from 'react';
import ReactH5AudioPlayer from 'react-h5-audio-player';
import { FaPlay, FaPause } from 'react-icons/fa';

import 'react-h5-audio-player/lib/styles.css';

interface AudioPlayerProps {
  url?: string;
  isLoading: boolean;
  autoPlay?: boolean;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  url = '',
  isLoading,
  autoPlay = false,
}) => {
  const playerRef = useRef<ReactH5AudioPlayer>(null);

  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.audio.current.playbackRate = 0.85;
    }
  }, []);

  return (
    <div className="relative w-[44px] h-[44px] flex items-center justify-center">
      {isLoading && (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10">
          <div className="w-[44px] h-[44px] border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      )}
      <ReactH5AudioPlayer
        ref={playerRef}
        src={url}
        autoPlay={autoPlay}
        showJumpControls={false}
        showDownloadProgress={false}
        customProgressBarSection={[]}
        customAdditionalControls={[]}
        customVolumeControls={[]}
        customIcons={{
          play: <FaPlay />,
          pause: <FaPause />,
        }}
        className={`bg-transparent shadow-none border-gray-600 ${
          !url ? 'opacity-50 pointer-events-none' : ''
        }`}
        layout="stacked-reverse"
      />
    </div>
  );
};
