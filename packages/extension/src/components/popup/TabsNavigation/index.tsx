import React from 'react';
import type { PopupTab } from '../../../store';
import { useGetTodayFlashcardsCount } from '../../../hooks/useGetTodayFlashcardsCount';

interface TabsNavigationProps {
  activeTab: PopupTab;
  onTabChange: (tab: PopupTab) => void;
}

export const TabsNavigation: React.FC<TabsNavigationProps> = ({
  activeTab,
  onTabChange,
}) => {
  const { count } = useGetTodayFlashcardsCount();

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
        onClick={() => onTabChange('flashcards')}
        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors relative ${
          activeTab === 'flashcards'
            ? 'border-blue-500 text-blue-600 bg-white'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
        }`}
      >
        Flashcards
        {count > 0 && (
          <span className="ml-1 inline-flex text-[14px] items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-white bg-green-700 rounded-full">
            +{count}
          </span>
        )}
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
