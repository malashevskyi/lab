import React from 'react';
import { useAppStore } from '../../../store';
import Analysis from '../Analysis';
import History from '../History';
import ContextDetails from '../ContextDetails';

export const AnalysisTab: React.FC = () => {
  const selectedText = useAppStore((state) => state.analysis.selectedText);

  if (!selectedText) {
    return (
      <div className="text-center text-gray-500 py-8">
        <p>
          Hold{' '}
          <kbd className="px-2 py-1 text-xs font-semibold bg-gray-100 border border-gray-300 rounded">
            Alt
          </kbd>{' '}
          + click on text to see analysis
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <ContextDetails />

      <div className="flex-1 overflow-y-auto">
        <Analysis />
        <History />
      </div>
    </div>
  );
};
