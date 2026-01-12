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

  it("should handle double-encoded characters (the don%2527t case)", () => {
    const url =
      "https://storage.googleapis.com/leeearning.appspot.com/enAudio/don%2527t%2520hesitate.mp3";
    const result = extractStoragePath(url);
    // It MUST be the raw string for the file system to find it
    expect(result).toBe("enAudio/don't hesitate.mp3");
  });

  it("should handle special characters like quotes and commas", () => {
    const url =
      "https://storage.googleapis.com/mybucket.appspot.com/path/%22we%20need%20to%20do%20that%22%2C%20he%20said..mp3";
    const result = extractStoragePath(url);
    // eslint-disable-next-line quotes
    expect(result).toBe('path/"we need to do that", he said..mp3');
  });

  it("should handle the double-encoded logs case (%2520 to space)", () => {
    // This is exactly the format from your logs
    const url =
      "https://storage.googleapis.com/leeearning.appspot.com/enAudio/can%2520you%2520call%2520him%2520for%2520me%253F.mp3";

    const result = extractStoragePath(url);

    // The expected result MUST be raw text for the file system
    expect(result).toBe("enAudio/can you call him for me?.mp3");
  });

  it("should handle double-encoded special punctuation like question marks (%253F)", () => {
    const url =
      "https://storage.googleapis.com/leeearning.appspot.com/enAudio/how%2520far%2520is%2520your%2520house%253F.mp3";

    const result = extractStoragePath(url);

    expect(result).toBe("enAudio/how far is your house?.mp3");
  });

  it("should handle filenames with trailing dots and encoding combined", () => {
    const url =
      "https://storage.googleapis.com/leeearning.appspot.com/enAudio/this%2520is%2520concentrated%2520orange%2520flavor..mp3";

    const result = extractStoragePath(url);

    // Note the double dot at the end: one for the sentence, one for the extension
    expect(result).toBe("enAudio/this is concentrated orange flavor..mp3");
  });

  it("should handle TRIPLE encoded URLs from logs (The 'Be careful' case)", () => {
    const url =
      "https://storage.googleapis.com/leeearning.appspot.com/enAudio/be%252520careful%25252C%252520it%252527s%252520slippery..mp3?GoogleAccessId=...";
    const result = extractStoragePath(url);

    // This is the literal path required by GCS
    expect(result).toBe("enAudio/be careful, it's slippery..mp3");
  });

  it("should handle double encoded URLs with question marks (The 'Where are you going' case)", () => {
    const url =
      "https://storage.googleapis.com/leeearning.appspot.com/enAudio/where%2520are%2520you%2520going%2520after%2520putting%2520on%2520your%2520clothes%253F.mp3?GoogleAccessId=...";
    const result = extractStoragePath(url);

    expect(result).toBe(
      "enAudio/where are you going after putting on your clothes?.mp3"
    );
  });
});
