import { setGlobalOptions } from "firebase-functions/v2";
import "./bootstrap";

setGlobalOptions({
  region: "europe-west1",
  secrets: ["SENTRY_DSN"],
});

export { default as refreshAudioRecordsSignedUrls } from "./audio/refreshAudioRecordsSignedUrls";
export { default as refreshFlashcardsSignedUrls } from "./audio/refreshFlashcardsSignedUrls";
export { default as refreshChunksSignedUrls } from "./audio/refreshChunksSignedUrls";
export { default as refreshSentencesSignedUrls } from "./audio/refreshSentencesSignedUrls";
export { default as refreshWordsSignedUrls } from "./audio/refreshWordsSignedUrls";
export { default as syncChunksToOldProject } from "./sync/syncChunksToOldProject";
export { default as syncSentencesToUserSentences } from "./sync/syncSentencesToUserSentences";
