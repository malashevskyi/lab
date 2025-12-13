interface ErrorDisplayProps {
  errorMessage?: string;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ errorMessage }) => {
  if (!errorMessage) {
    return null;
  }

  return (
    <div className="text-red-600 bg-red-50 p-3 rounded-md border border-solid border-red-200">
      <p className="text-xs mt-1">
        {errorMessage || 'An unexpected error occurred.'}
      </p>
    </div>
  );
};
