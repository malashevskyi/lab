import type { AnalysisResponse } from '@lab/types/assistant/ai';
import { useAudioGeneration } from '../../../hooks/useAudioGeneration';
import { AudioPlayer } from '../AudioPlayer';

interface AudioProps {
  analysisData: AnalysisResponse | null;
}

const Audio: React.FC<AudioProps> = ({ analysisData }) => {
  const { audioUrl, isLoadingAudio } = useAudioGeneration(
    analysisData?.word.text
  );

  return <AudioPlayer url={audioUrl} isLoading={isLoadingAudio} />;
};

export default Audio;
