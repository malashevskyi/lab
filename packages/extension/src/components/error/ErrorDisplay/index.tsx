import React from "react";
import type { ApiError } from "../../../services/ApiError";

interface ErrorDisplayProps {
  error: ApiError | null;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error }) => {
  if (!error) {
    return null;
  }

  return (
    <div className="text-red-600 bg-red-50 p-3 rounded-md border border-red-200">
      <p className="text-xs mt-1">
        {error.message || "An unexpected error occurred."}
      </p>
    </div>
  );
};
