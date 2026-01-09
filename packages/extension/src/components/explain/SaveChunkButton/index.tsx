import React from "react";
import { useSaveChunk } from "../../../hooks/useSaveChunk";
import { expandSelectionAcrossNodes } from "../../../features/content/ContentScriptRoot/utils/expandSelectionAcrossNodes";

interface SaveChunkButtonProps {
  onHide: () => void;
}

export const SaveChunkButton: React.FC<SaveChunkButtonProps> = ({ onHide }) => {
  const { saveChunk } = useSaveChunk();

  const handleSaveChunk = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      onHide();
      return;
    }

    // Expand selection to full words/sentence boundaries
    const expandedSelection = expandSelectionAcrossNodes(selection);
    const expandedText = expandedSelection.toString().trim();

    if (!expandedText) {
      onHide();
      return;
    }

    // Save in background (no loader, silent success)
    saveChunk(expandedText);

    // Close menu immediately
    onHide();
  };

  return (
    <button
      onClick={handleSaveChunk}
      className="flex items-center gap-2 px-3 py-2 border border-solid border-gray-300 text-sm font-medium text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors"
      title="Save this text as a chunk for learning"
      type="button"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
        <polyline points="17 21 17 13 7 13 7 21" />
        <polyline points="7 3 7 8 15 8" />
      </svg>
      <span>Save Chunk</span>
    </button>
  );
};
