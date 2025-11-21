import { describe, it, expect } from "vitest";
import { extractStoragePath } from "./extractStoragePath";

describe("extractStoragePath", () => {
  it("should extract storage path from Firebase Storage signed URL", () => {
    const url =
      "https://storage.googleapis.com/deep-read-ai.firebasestorage.app/audio/according.mp3?GoogleAccessId=deep-read-ai%40appspot.gserviceaccount.com&Expires=1763750843&Signature=vNuLspvyJtFmDRrltoGQGkEMmlQeLAp%2Fz%2FNNISvifvxzsvQ%2BoIviAbnpTHW5Z3tV2qNvr5h%2BRSLKclLWpSKGH2WyNX0mYs9WS%2F5cdo65DZ9Rj4HhLzHlsmJk6hg8fw0j%2Kzfa45B25gKyXdndJ7rPmfj6ylbbtv3wGp6KX9GXlggc%2FCZV8pbD9jpeaRJJ%2BBkMa4ywF8y272bzWD2UWxXcojBmj0%2F1rNDW7b3vQMDLjrHXsCbeOILXbXy7AhVJUMi%2BqklQ6%2FTQ%2F60HvWMxCLCB%2FkKv0nO0Qb4D6qYQAu352FMxJGA2dNEWfbDoQxSuOVBx2na8mtMy2obLcC0Q%3D%3D";

    const result = extractStoragePath(url);

    expect(result).toBe("audio/according.mp3");
  });

  it("should extract nested path with multiple segments", () => {
    const url =
      "https://storage.googleapis.com/bucket/o/folder%2Fsubfolder%2Ffile.mp3?token=abc123";

    const result = extractStoragePath(url);

    expect(result).toBe("folder/subfolder/file.mp3");
  });

  it("should handle paths with special characters", () => {
    const url =
      "https://storage.googleapis.com/bucket/o/audio%2Ftest%20file%20(1).mp3?token=abc123";

    const result = extractStoragePath(url);

    expect(result).toBe("audio/test file (1).mp3");
  });

  it("should return null for invalid URL", () => {
    const result = extractStoragePath("not-a-valid-url");

    expect(result).toBeNull();
  });

  it("should return null for URL with only one path segment", () => {
    const url =
      "https://storage.googleapis.com/bucket/some-path-without-separator?token=abc123";

    const result = extractStoragePath(url);

    expect(result).toBeNull();
  });

  it("should return null for empty string", () => {
    const result = extractStoragePath("");

    expect(result).toBeNull();
  });

  it("should handle URL without query parameters", () => {
    const url = "https://storage.googleapis.com/bucket/o/audio%2Ffile.mp3";

    const result = extractStoragePath(url);

    expect(result).toBe("audio/file.mp3");
  });

  it("should handle the exact example from the user", () => {
    const url =
      "https://storage.googleapis.com/deep-read-ai.firebasestorage.app/audio/according.mp3?GoogleAccessId=deep-read-ai%40appspot.gserviceaccount.com&Expires=1763750843&Signature=vNuLspvyJtFmDRrltoGQGkEMmlQeLAp%2Fz%2FNNISvifvxzsvQ%2BoIviAbnpTHW5Z3tV2qNvr5h%2BRSLKclLWpSKGH2WyNX0mYs9WS%2F5cdo65DZ9Rj4HhLzHlsmJk6hg8fw0j%2Kzfa45B25gKyXdndJ7rPmfj6ylbbtv3wGp6KX9GXlggc%2FCZV8pbD9jpeaRJJ%2BBkMa4ywF8y272bzWD2UWxXcojBmj0%2F1rNDW7b3vQMDLjrHXsCbeOILXbXy7AhVJUMi%2BqklQ6%2FTQ%2F60HvWMxCLCB%2FkKv0nO0Qb4D6qYQAu352FMxJGA2dNEWfbDoQxSuOVBx2na8mtMy2obLcC0Q%3D%3D";

    const result = extractStoragePath(url);

    // This is a direct format URL (without /o/), should extract path after bucket name
    expect(result).toBe("audio/according.mp3");
  });

  it("should handle direct format URL without /o/", () => {
    const url =
      "https://storage.googleapis.com/bucket-name.firebasestorage.app/folder/subfolder/file.mp3?token=abc";

    const result = extractStoragePath(url);

    expect(result).toBe("folder/subfolder/file.mp3");
  });
});
