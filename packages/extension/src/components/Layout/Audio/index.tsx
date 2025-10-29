import type { AnalysisResponse } from '@lab/types/deep-read/ai';
import { useAudioGeneration } from '../../../hooks/useAudioGeneration';
import { AudioPlayer } from '../../ui/AudioPlayer';

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
