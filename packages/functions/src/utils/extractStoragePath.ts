/**
 * Extracts the storage path from a Firebase Storage signed URL.
 *
 * Supports two URL formats:
 * 1. REST API format: https://storage.googleapis.com/bucket/o/path%2Fto%2Ffile.mp3?token=...
 * 2. Direct format: https://storage.googleapis.com/bucket.domain/path/to/file.mp3?token=...
 *
 * @param signedUrl - The Firebase Storage signed URL
 * @returns The decoded storage path, or null if extraction fails
 *
 * @example
 * const url1 = "https://storage.googleapis.com/bucket/o/path%2Fto%2Ffile.mp3?token=...";
 * const path1 = extractStoragePath(url1); // Returns: "path/to/file.mp3"
 *
 * @example
 * // Direct format
 * const url2 = "https://storage.googleapis.com/bucket.firebasestorage.app/audio/file.mp3?token=...";
 * const path2 = extractStoragePath(url2); // Returns: "audio/file.mp3"
 */
export function extractStoragePath(signedUrl: string): string | null {
  try {
    const urlObj = new URL(signedUrl);

    // Check if it's a Firebase Storage URL
    if (!urlObj.hostname.includes("storage.googleapis.com")) {
      return null;
    }

    let resultPath: string | null = null;

    // Try REST API format first: /bucket/o/{encodedPath} or /o/{encodedPath}
    const restApiMatch = urlObj.pathname.match(/\/o\/(.+?)(?:\?|$)/);
    if (restApiMatch && restApiMatch[1]) {
      resultPath = decodeURIComponent(restApiMatch[1]);
    } else {
      // Try direct format: /bucket.domain/path/to/file
      // The bucket name contains a dot (like bucket.firebasestorage.app)
      const pathParts = urlObj.pathname.split("/").filter(Boolean);

      // First segment should be bucket name with domain (contains dot)
      if (pathParts.length >= 2 && pathParts[0].includes(".")) {
        // Skip the first segment (bucket name) and join the rest
        resultPath = decodeURIComponent(pathParts.slice(1).join("/"));
      }
    }

    while (resultPath && resultPath.includes("%")) {
      resultPath = decodeURIComponent(resultPath);
    }

    return resultPath;
  } catch (error) {
    return null;
  }
}
