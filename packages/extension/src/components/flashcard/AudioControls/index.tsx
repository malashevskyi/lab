import { AudioPlayer } from '../../audio/AudioPlayer';

interface AudioControlsProps {
  audioUrl: string;
  isGenerating: boolean;
  onRegenerate: () => void;
}

export const AudioControls: React.FC<AudioControlsProps> = ({
  audioUrl,
  isGenerating,
  onRegenerate,
}) => {
  return (
    <>
      <AudioPlayer url={audioUrl} isLoading={isGenerating} />
      <button
        onClick={onRegenerate}
        disabled={isGenerating}
        className="px-2 py-1 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 border border-solid border-blue-200 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="Regenerate audio"
      >
        Regenerate
      </button>
    </>
  );
};
