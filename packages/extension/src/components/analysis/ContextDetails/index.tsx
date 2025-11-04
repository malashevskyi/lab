import { useAppStore } from '../../../store';

const ContextDetails = () => {
  const selectionContext = useAppStore((state) => state.analysis.context);

  if (!selectionContext) return null;

  return (
    <details className="mb-4 text-xs text-gray-500 cursor-pointer">
      <summary className="outline-none">Show Context</summary>
      <p className="mt-2 p-2 bg-gray-50 border rounded-md italic">
        {selectionContext}
      </p>
    </details>
  );
};

export default ContextDetails;
