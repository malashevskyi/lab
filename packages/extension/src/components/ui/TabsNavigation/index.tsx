import React from 'react';
import type { PopupTab } from '../../../store';

interface TabsNavigationProps {
  activeTab: PopupTab;
  onTabChange: (tab: PopupTab) => void;
}

export const TabsNavigation: React.FC<TabsNavigationProps> = ({
  activeTab,
  onTabChange,
}) => {
  return (
    <div className="flex">
      <button
        onClick={() => onTabChange('new-flashcard')}
        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
          activeTab === 'new-flashcard'
            ? 'border-blue-500 text-blue-600 bg-white'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
        }`}
      >
        New Flashcard
      </button>
      <button
        onClick={() => onTabChange('last-flashcard')}
        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
          activeTab === 'last-flashcard'
            ? 'border-blue-500 text-blue-600 bg-white'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
        }`}
      >
        Last Flashcard
      </button>
      <button
        onClick={() => onTabChange('analysis')}
        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
          activeTab === 'analysis'
            ? 'border-blue-500 text-blue-600 bg-white'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
        }`}
      >
        Analysis
      </button>
    </div>
  );
};
