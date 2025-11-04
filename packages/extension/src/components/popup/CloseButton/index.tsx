import type React from 'react';
import { FaTimes } from 'react-icons/fa';

export const CloseButton: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <button
      type="button"
      onClick={onClose}
      className="p-2 text-gray-400 hover:text-gray-600 z-10"
      title="Clear all selections"
    >
      <FaTimes />
    </button>
  );
};
