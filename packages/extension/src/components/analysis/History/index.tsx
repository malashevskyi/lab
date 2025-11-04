import { useWordHistory } from '../../../hooks/useTextHistory';
import HighlightText from '../HighlightText';

const History: React.FC = () => {
  const { historyData, isLoadingHistory } = useWordHistory();

  if (isLoadingHistory) {
    return (
      <div className="my-4">
        <em>Loading history...</em>
      </div>
    );
  }

  if (!historyData) {
    return (
      <div className="my-4 text-gray-500">
        <em>No saved examples found.</em>
      </div>
    );
  }

  return (
    <div className="my-6 pt-4">
      <div className="space-y-4">
        <div className="flex flex-col space-y-2">
          <span className="font-semibold text-lg">
            {historyData.translation}
          </span>
        </div>

        <div className="space-y-4">
          {historyData.examples.map((example, index) => (
            <div key={index} className="pl-4 border-l-2 border-blue-200">
              <strong className="text-sm text-gray-600">
                {example.accentTranscription}
              </strong>
              <p className="text-gray-700">
                <HighlightText
                  text={example.example}
                  highlight={example.accent}
                />
              </p>
              <p className="mt-1 text-sm text-gray-500">
                <em>{example.translation}</em>
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default History;
