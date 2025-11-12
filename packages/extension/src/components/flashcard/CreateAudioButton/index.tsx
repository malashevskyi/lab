import { LoadingButton } from '../../ui/LoadingButton';

interface CreateAudioButtonProps {
  onClick: () => void;
  isGenerating: boolean;
}

export const CreateAudioButton: React.FC<CreateAudioButtonProps> = ({
  onClick,
  isGenerating,
}) => {
  return (
    <LoadingButton
      onClick={onClick}
      isLoading={isGenerating}
      loadingText="Generating..."
      idleText="Create Audio"
      className="px-3 py-1.5 text-xs font-medium text-white bg-blue-500 hover:bg-blue-600 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
      title="Create audio for question"
    />
  );
};
