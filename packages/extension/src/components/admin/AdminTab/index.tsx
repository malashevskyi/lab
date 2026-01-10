import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { assistantApi } from "../../../services/api";
import { fromUnknown } from "../../../services/errorUtils";

interface ProcessChunksResult {
  total: number;
  processed: number;
  errors: number;
}

export const AdminTab: React.FC = () => {
  const [result, setResult] = useState<ProcessChunksResult | null>(null);

  const processChunksMutation = useMutation({
    mutationFn: async () => {
      const response = await assistantApi.post<ProcessChunksResult>(
        "/chunks/process-existing"
      );
      return response.data;
    },
    onSuccess: (data) => {
      setResult(data);
      toast.success(
        `Processed ${data.processed} of ${data.total} chunks. Errors: ${data.errors}`
      );
    },
    onError: (error) => {
      fromUnknown(error, {
        clientMessage: "Failed to process existing chunks.",
        notify: true,
      });
    },
  });

  return (
    <div className="p-4 space-y-4">
      <div className="border border-gray-200 rounded-lg p-4 space-y-3">
        <h4 className="font-medium text-gray-900">Process Existing Chunks</h4>
        <p className="text-sm text-gray-600">
          This will find all chunks without translation or audio, process them
          with AI to adjust the text, translate to Ukrainian, and generate
          audio. The original chunk text will be updated with the adjusted
          version.
        </p>

        <button
          onClick={() => processChunksMutation.mutate()}
          disabled={processChunksMutation.isPending}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {processChunksMutation.isPending
            ? "Processing..."
            : "Process Existing Chunks"}
        </button>

        {result && (
          <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-md">
            <h5 className="font-medium text-gray-900 mb-2">Results:</h5>
            <div className="text-sm text-gray-700 space-y-1">
              <div>
                <span className="font-medium">Total found:</span> {result.total}
              </div>
              <div>
                <span className="font-medium">Successfully processed:</span>{" "}
                {result.processed}
              </div>
              <div>
                <span className="font-medium">Errors:</span> {result.errors}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
