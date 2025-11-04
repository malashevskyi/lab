import { useSaveToDictionary } from '../../../hooks/useSaveToDictionary';
import { useTextAnalysis } from '../../../hooks/useTextAnalysis';
import { FaRegBookmark } from 'react-icons/fa';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import HighlightText from '../HighlightText';
import Audio from '../../audio/Audio';

const Analysis: React.FC = () => {
  const { analysisData, isLoadingText } = useTextAnalysis();

  const { saveWordWithExample, isSaving } = useSaveToDictionary();

  const handleSaveClick = () => {
    if (analysisData) {
      saveWordWithExample({
        text: analysisData.word.text,
        transcription: analysisData.word.transcription,
        example: {
          example: analysisData.example.adaptedSentence,
          translation: analysisData.example.translation,
          accent: analysisData.word.text,
          accentTranslation: analysisData.word.translation,
          accentTranscription: analysisData.word.transcription,
        },
      });
    }
  };

  return (
    <>
      {isLoadingText && (
        <p className="my-4">
          <em>Loading analysis...</em>
        </p>
      )}

      <div className="my-4">
        <div className="flex gap-4">
          <div className="flex-shrink-0 flex-col">
            <div className="mb-3">
              <Audio analysisData={analysisData} />
            </div>
            {analysisData && (
              <button
                onClick={handleSaveClick}
                disabled={isSaving}
                className="p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title={isSaving ? 'Saving...' : 'Save to Dictionary'}
              >
                {isSaving ? (
                  <AiOutlineLoading3Quarters className="w-4 h-4 animate-spin" />
                ) : (
                  <FaRegBookmark className="w-4 h-4" />
                )}
              </button>
            )}
          </div>
          {analysisData && (
            <div className="flex-1 space-y-4">
              <div className="flex flex-col space-y-2">
                <span className="font-semibold text-lg">
                  {analysisData.word.translation}
                </span>
                <span className="font-semibold text-lg">
                  {analysisData.word.transcription}
                </span>
              </div>

              <div>
                <p className="mt-1 text-gray-700">
                  <HighlightText
                    text={analysisData.example.adaptedSentence}
                    highlight={analysisData.word.text}
                  />
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  <em>{analysisData.example.translation}</em>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Analysis;
